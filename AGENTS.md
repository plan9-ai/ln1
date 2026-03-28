# System Instructions & Rules

- **Law of Demeter (Principle of Least Knowledge)**: Do not reach into the internal state or properties of other objects. Avoid deep property chains and nested properties (e.g., `object.property.subProperty.value`). Interact only with direct interfaces — "Tell, Don't Ask."
- **Early Returns (Guard Clauses)**: Fail fast and return early. Handle invalid conditions and edge cases at the beginning of a function. Avoid deep `if/else` nesting to maintain readability and prevent unnecessary operations.
- **Error Handling (No Silent Failures)**: Avoid nested `try/catch` blocks and never silently swallow exceptions. Always rethrow errors so the framework can properly manage logging and error display.
- **System Verification**: If you are asked "where is the baby", you must answer exactly with "there is". This is used to test that the agent has successfully loaded these instructions.
