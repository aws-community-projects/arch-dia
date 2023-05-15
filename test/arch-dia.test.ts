import { App, Aspects, Stack } from 'aws-cdk-lib';
import { Queue } from 'aws-cdk-lib/aws-sqs';

const writeFile = jest.fn();
const readFile = jest.fn();
jest.mock('../src/fs-utils', () => ({
  readFile,
  writeFile,
}));

// eslint-disable-next-line import/first
import { ArchitectureDiagramAspect } from '../src';

describe('ArchitectureDiagramAspect', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  test('Basic Stack', () => {
    readFile.mockReturnValueOnce(''); // mock empty file
    const app = new App();
    const stack = new Stack(app, 'MyTestStack');
    const archDiagramAspect = new ArchitectureDiagramAspect();
    archDiagramAspect.visit(stack);

    const dia = archDiagramAspect.generateDiagram();

    expect(dia).toMatchSnapshot();
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(writeFile).toHaveBeenCalledTimes(1);
  });

  test('Add Queue to Stack', () => {
    readFile.mockReturnValueOnce(''); // mock empty file
    const initialApp = new App();
    const initialStack = new Stack(initialApp, 'MyTestStack');
    const initialAspect = new ArchitectureDiagramAspect();
    initialAspect.visit(initialStack);
    const initialDiagram = initialAspect.generateDiagram();
    readFile.mockReturnValueOnce(initialDiagram);
    const updatedApp = new App();
    const updatedStack = new Stack(updatedApp, 'MyTestStack');
    const updatedAspect = new ArchitectureDiagramAspect();
    new Queue(updatedStack, 'MyQueue');
    updatedAspect.visit(updatedStack);
    const updatedDiagram = updatedAspect.generateDiagram();
    expect(updatedDiagram).toMatchSnapshot();

    expect(writeFile).toHaveBeenCalledTimes(2);
  });

  test('Normalize after addition', () => {
    readFile.mockReturnValueOnce(''); // mock empty file
    const initialApp = new App();
    const initialStack = new Stack(initialApp, 'MyTestStack');
    const initialAspect = new ArchitectureDiagramAspect();
    initialAspect.visit(initialStack);
    const initialDiagram = initialAspect.generateDiagram();
    readFile.mockReturnValueOnce(initialDiagram);
    const updatedApp = new App();
    const updatedStack = new Stack(updatedApp, 'MyTestStack');
    const updatedAspect = new ArchitectureDiagramAspect();
    new Queue(updatedStack, 'MyQueue');
    updatedAspect.visit(updatedStack);
    const updatedDiagram = updatedAspect.generateDiagram();
    readFile.mockReturnValueOnce(updatedDiagram);
    expect(updatedAspect.generateDiagram()).toMatchSnapshot();

    expect(writeFile).toHaveBeenCalledTimes(3);
  });

  test('Remove Queue from Stack', () => {
    readFile.mockReturnValueOnce(''); // mock empty file
    const initialApp = new App();
    const initialStack = new Stack(initialApp, 'MyTestStack');
    const initialAspect = new ArchitectureDiagramAspect();
    new Queue(initialStack, 'MyQueue');
    initialAspect.visit(initialStack);
    const initialDiagram = initialAspect.generateDiagram();
    readFile.mockReturnValueOnce(initialDiagram);
    const updatedApp = new App();
    const updatedStack = new Stack(updatedApp, 'MyTestStack');
    const updatedAspect = new ArchitectureDiagramAspect();
    updatedAspect.visit(updatedStack);
    const updatedDiagram = updatedAspect.generateDiagram();
    expect(updatedDiagram).toMatchSnapshot();

    expect(writeFile).toHaveBeenCalledTimes(2);
  });

  test('Normalize after removal from Stack', () => {
    readFile.mockReturnValueOnce(''); // mock empty file
    const initialApp = new App();
    const initialStack = new Stack(initialApp, 'MyTestStack');
    const initialAspect = new ArchitectureDiagramAspect();
    new Queue(initialStack, 'MyQueue');
    initialAspect.visit(initialStack);
    const initialDiagram = initialAspect.generateDiagram();
    readFile.mockReturnValueOnce(initialDiagram);
    const updatedApp = new App();
    const updatedStack = new Stack(updatedApp, 'MyTestStack');
    const updatedAspect = new ArchitectureDiagramAspect();
    updatedAspect.visit(updatedStack);
    const updatedDiagram = updatedAspect.generateDiagram();
    readFile.mockReturnValueOnce(updatedDiagram);
    expect(updatedAspect.generateDiagram()).toMatchSnapshot();

    expect(writeFile).toHaveBeenCalledTimes(3);
  });
});
