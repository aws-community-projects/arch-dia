# Architecture Diagram Aspect

This CDK Aspect traverses the stack to generate a GitHub / markdown compatible mermaid chart of the AWS Resources created by the stack.

It outputs this as a markdown folder based on the stack's id.  For example:

`new Stack(new App(), 'asdf');`

would create a markdown file called `asdf.md`.

On each subsequent synthesis, the Aspect will read the stack's existing markdown file (if it exists) and infer architecture changes b/w before and after.  It will then replace the markdown file with a visual diff of the architecture (see examples below).

This uses no external dependencies!

- Green boxes indicate resources that were added
- Red boxes indicates resources that were removed
- Thick arrow lines indicate a new linkage
- Normal arrow lines indicate an existing linkage
- dashed/dotted arrow lines indicate a removed linkage

## Example 1 - Simple Stack

```mermaid
graph LR;
c814b2c5dc22d11a84e78a63be7bb7815715b70534[MyTestStack]
classDef default fill:#fff,stroke:#000,color:black;
classDef added fill:#cfc,stroke:#cfc,stroke-width:2px,color:black;
classDef removed fill:#fcc,stroke:#fcc,stroke-width:2px,color:black;
```

## Example 2 - Queue Added to Stack

```mermaid
graph LR;
c814b2c5dc22d11a84e78a63be7bb7815715b70534[MyTestStack]
c814b2c5dc22d11a84e78a63be7bb7815715b70534[MyTestStack] ==> c8a33fea56cf1bd6e8b5c652f393a6d315e7a78836[MyQueue]:::added
c8a33fea56cf1bd6e8b5c652f393a6d315e7a78836[MyQueue]:::added ==> c80cb3f181e7dbb6726caf602717b2585dabff5aff[Resource - AWS::SQS::Queue]:::added
classDef default fill:#fff,stroke:#000,color:black;
classDef added fill:#cfc,stroke:#cfc,stroke-width:2px,color:black;
classDef removed fill:#fcc,stroke:#fcc,stroke-width:2px,color:black;
```

## Example 3 - Stack re-synthed AFTER the queue was added

```mermaid
graph LR;
c814b2c5dc22d11a84e78a63be7bb7815715b70534[MyTestStack]
c814b2c5dc22d11a84e78a63be7bb7815715b70534[MyTestStack] --> c8a33fea56cf1bd6e8b5c652f393a6d315e7a78836[MyQueue]
c8a33fea56cf1bd6e8b5c652f393a6d315e7a78836[MyQueue] --> c80cb3f181e7dbb6726caf602717b2585dabff5aff[Resource - AWS::SQS::Queue]
classDef default fill:#fff,stroke:#000,color:black;
classDef added fill:#cfc,stroke:#cfc,stroke-width:2px,color:black;
classDef removed fill:#fcc,stroke:#fcc,stroke-width:2px,color:black;
```

## Example 4 - Queue Removed

```mermaid
graph LR;
c814b2c5dc22d11a84e78a63be7bb7815715b70534[MyTestStack]
c814b2c5dc22d11a84e78a63be7bb7815715b70534[MyTestStack] -.-> c8a33fea56cf1bd6e8b5c652f393a6d315e7a78836[MyQueue]:::removed
c8a33fea56cf1bd6e8b5c652f393a6d315e7a78836[MyQueue]:::removed -.-> c80cb3f181e7dbb6726caf602717b2585dabff5aff[Resource - AWS::SQS::Queue]:::removed
classDef default fill:#fff,stroke:#000,color:black;
classDef added fill:#cfc,stroke:#cfc,stroke-width:2px,color:black;
classDef removed fill:#fcc,stroke:#fcc,stroke-width:2px,color:black;
```

## Example 5 - Stack re-synthed AFTER the queue was removed

```mermaid
graph LR;
c814b2c5dc22d11a84e78a63be7bb7815715b70534[MyTestStack]
classDef default fill:#fff,stroke:#000,color:black;
classDef added fill:#cfc,stroke:#cfc,stroke-width:2px,color:black;
classDef removed fill:#fcc,stroke:#fcc,stroke-width:2px,color:black;
```