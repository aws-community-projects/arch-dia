import { CfnResource, IAspect, Stack } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import { readFile, writeFile } from './fs-utils';

export class ArchitectureDiagramAspect implements IAspect {
  private readonly mermaidDiagram: string[];
  private stackName = '';

  constructor () {
    this.mermaidDiagram = [];
  }

  visit (node: IConstruct): void {
    if (node instanceof Stack) {
      this.stackName = node.stackName;
      this.traverseConstruct(node, '');
    }
  }

  private traverseConstruct (construct: IConstruct, parentPath: string): void {
    const parentSplit = parentPath.split(' --> ');
    const currentParent = parentSplit[parentSplit.length - 1];
    if (CfnResource.isCfnResource(construct)) {
      console.log(
        `CfnResource: ${construct.node.addr} - ${construct.node.id} - ${JSON.stringify(construct.cfnOptions)}`,
      );
    }
    const currentPath = `${currentParent}${currentParent ? ' --> ' : ''}${
      construct.node.addr
    }[${construct.node.id}${
      CfnResource.isCfnResource(construct)
        ? ` - ${construct.cfnResourceType}`
        : ''
    }]`;
    this.mermaidDiagram.push(`${currentPath}`);

    construct.node.children.forEach((child) => {
      this.traverseConstruct(child, currentPath);
    });
  }

  generateDiagram (): string {
    // Return the generated Mermaid diagram as part of a Markdown document
    // write the mermaid diagram to a file
    let last: string[] = [];
    try {
      last = readFile(`${this.stackName}.md`)
        .toString()
        .split('\n')
        .filter((row) => !row.includes('classDef')) // class definitions added separately
        .filter((row) => !row.includes('graph LR;')) // graph definition added separately
        .filter((row) => !row.includes('-.->')) // dotted lines mean they were removed the time before, normalize
        .map((row) => row.replace('==>', '-->')) // double lines mean they were added, normalize
        .map((row) => row.replace(/:::(added|removed)/g, '')); // remove classes (will be added back later, if needed)
    } catch (e) {
      // noop
    }
    const mermaidIndex = last.indexOf('```mermaid');
    let old: string[] = [];
    if (mermaidIndex > -1) {
      old = last.splice(mermaidIndex + 1, last.length - mermaidIndex);
      old = old.splice(0, old.indexOf('```'));
    }
    const oldElements = old.reduce((p, c) => {
      c.split(' --> ')
        .map((row) => row.trim())
        .forEach((e) => p.add(e.split(':::')[0]));
      return p;
    }, new Set<string>());
    const newElements = this.mermaidDiagram.reduce((p, c) => {
      c.split(' --> ')
        .map((row) => row.trim())
        .forEach((e) => p.add(e.split(':::')[0]));
      return p;
    }, new Set<string>());
    const addedElements = [...newElements].filter((e) => !oldElements.has(e));
    const removedElements = [...oldElements].filter((e) => !newElements.has(e));
    const added = this.mermaidDiagram.filter((line) => !old.includes(line));
    const removed = old.filter((line) => !this.mermaidDiagram.includes(line));
    const neutral = this.mermaidDiagram.filter(
      (line) => !added.includes(line) && !removed.includes(line),
    );

    const mapChanges = (row: string, arrow: string): string => {
      const splitRow = row.split(/(--|==|-\.-)>/).map((row) => row.trim());
      if (splitRow.length !== 3) {
        return row;
      }
      let outputRow = '';
      if (addedElements.includes(splitRow[0])) {
        outputRow = `${splitRow[0]}:::added`;
      } else if (removedElements.includes(splitRow[0])) {
        outputRow = `${splitRow[0]}:::removed`;
      } else {
        outputRow = splitRow[0];
      }
      outputRow += ` ${arrow} `;
      if (addedElements.includes(splitRow[2])) {
        outputRow += `${splitRow[2]}:::added`;
      } else if (removedElements.includes(splitRow[2])) {
        outputRow += `${splitRow[2]}:::removed`;
      } else {
        // ignoring this because I don't think it would ever happen in practice
        // in this scenario a link to an existing element is being added or removed
        /* istanbul ignore next */
        outputRow += splitRow[2];
      }
      return outputRow;
    };

    const combined = [
      'graph LR;',
      ...neutral, // elements and connections existed before
      ...added.map((row) => mapChanges(row, '==>')),
      ...removed.map((row) => mapChanges(row, '-.->')),
      ...[
        'classDef default fill:#fff,stroke:#000,color:black;',
        'classDef added fill:#cfc,stroke:#cfc,stroke-width:2px,color:black;',
        'classDef removed fill:#fcc,stroke:#fcc,stroke-width:2px,color:black;',
      ],
    ];

    const markdown = [
      `# ${this.stackName}`,
      '',
      '```mermaid',
      ...combined,
      '```',
      '',
    ].join('\n');
    writeFile(`${this.stackName}.md`, markdown);

    return markdown;
  }
}
