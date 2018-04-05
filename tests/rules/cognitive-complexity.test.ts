import { RuleTester } from "eslint";

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2018, sourceType: "module" } });
import rule = require("../../src/rules/cognitive-complexity");

ruleTester.run("cognitive-complexity", rule, {
  valid: [
    // { code: `function zero_complexity() {}`, options: [0] }
  ],
  invalid: [
    // if
    {
      code: `function single_if() {
        if (x) {} // +1
      }`,
      options: [0],
      errors: [message(1, { line: 1, column: 10, endColumn: 19 })],
    },
    {
      code: `
      function if_else_complexity() {
        if (condition) {        // +1
        } else if (condition) { // +1
        } else {}               // +1
      }`,
      options: [0],
      errors: [message(3)],
    },
    {
      code: `
      function else_nesting() {
        if (condition) {      // +1
        } else {              // +1 (nesting level +1)
            if (condition) {} // +2
        }
      }`,
      options: [0],
      errors: [message(4)],
    },
    {
      code: `
      function else_nested() {
        if (condition) {      // +1 (nesting level +1)
          if (condition) {    // +2
          } else {}           // +1
        }
      }`,
      options: [0],
      errors: [message(4)],
    },
    {
      code: `
      function if_nested() {
        if (condition)          // +1 (nesting level +1)
          if (condition)        // +2 (nesting level +1)
            if (condition) {}   // +3
      }`,
      options: [0],
      errors: [message(6)],
    },
    {
      code: `
      function else_if_nesting() {
        if (condition) {         // +1
        } else if (condition) {  // +1 (nesting level +1)
          if (condition) {}      // +2
        }
      }`,
      options: [0],
      errors: [message(4)],
    },

    // loops
    {
      code: `
      function loops_complexity() {
        while (condition) {                 // +1 (nesting level +1)
          if (condition) {}                 // +2
        }

        do {                                // +1 (nesting level +1)
          if (condition) {}                 // +2
        } while (condition)

        for (i = 0; i < length; i++) {      // +1 (nesting level +1)
          if (condition) {}                 // +2

          for (i = 0; i < length; i++) {}  // +2
        }

        for (x in obj) {                    // +1 (nesting level +1)
          if (condition) {}                 // +2
        }

        for (x of obj) {                    // +1 (nesting level +1)
          if (condition) {}                 // +2
        }
      }`,
      options: [0],
      errors: [message(17)],
    },

    // switch
    {
      code: `
      function switch_complexity() {
        if (condition) {                 // +1 (nesting level +1)
          switch (expr) {                // +2 (nesting level +1)
            case "1":
              if (condition) {}          // +3
              break;
            case "2":
              break;
            default:
              foo();
          }
        }
      }`,
      options: [0],
      errors: [message(6)],
    },

    // continue & break
    {
      code: `
      function jump_statements_no_complexity() {
        if (condition)           // +1
          return;
        else if (condition)      // +1
          return 42;

        label:
        while (condition) {      // +1 (nesting level +1)
          if (condition)         // +2
            break;
          else if (condition)    // +1
            continue;
        }
      }`,
      options: [0],
      errors: [message(6)],
    },
    {
      code: `
      function break_continue_with_label() {
        label:
        while (condition) {
          break label;           // +1
          continue label;        // +1
        }
      }`,
      options: [0],
      errors: [message(3)],
    },

    // try-catch-finally
    {
      code: `
      function try_catch() {
        try {
          if (condition) {}      // +1
        } catch (someError) {    // +1 (nesting level +1)
          if (condition)  {}     // +2
        } finally {
          if (condition) {}      // +1
        }
      }`,
      options: [0],
      errors: [message(5)],
    },
    {
      code: `
      function try_finally() {
        try {
          if (condition) {}      // +1
        } finally {
          if (condition) {}      // +1
        }
      }`,
      options: [0],
      errors: [message(2)],
    },
    {
      code: `
      function nested_try_catch() {
        try {
          if (condition) {       // +1 (nesting level +1)
            try {}
            catch (someError) {} // +2
          }
        } finally {}
      }`,
      options: [0],
      errors: [message(3)],
    },

    // expressions
    {
      code: `
      function and_or() {
        foo(1 && 2 && 3 && 4); // +1
        foo((1 && 2) && (3 && 4)); // +1
        foo(((1 && 2) && 3) && 4); // +1
        foo(1 && (2 && (3 && 4))); // +1
        foo(1 || 2 || 3 || 4); // +1
        foo(1 && 2 || 3 || 4); // +2
        foo(1 && 2 || 3 && 4); // +3
        foo(1 && 2 && !(3 && 4)); // +2
      }`,
      options: [0],
      errors: [message(12)],
    },
    {
      code: `
      function conditional_expression() {
        return condition ? trueValue : falseValue;
      }`,
      options: [0],
      errors: [message(1)],
    },
    {
      code: `
      function nested_conditional_expression() {
        x = condition1 ? (condition2 ? trueValue2 : falseValue2) : falseValue1 ; // +3
        x = condition1 ? trueValue1 : (condition2 ? trueValue2 : falseValue2)  ; // +3
        x = condition1 ? (condition2 ? trueValue2 : falseValue2) : (condition3 ? trueValue3 : falseValue3); // +5
      }`,
      options: [0],
      errors: [message(11)],
    },
    {
      code: `
      function complexity_in_conditions(a, b) {
        if (a && b) {                            // +1(if) +1(&&)
          a && b;                                // +1 (no nesting)
        }
        while (a && b) {}                        // +1(while) +1(&&)
        do {} while (a && b)                     // +1(do) +1(&&)
        for (var i = a && b; a && b; a && b) {}  // +1(for) +1(&&)  +1(&&)  +1(&&)
      }`,
      options: [0],
      errors: [message(11)],
    },

    // different function types
    {
      code: "var arrowFunction = (a, b) => a && b;",
      options: [0],
      errors: [message(1, { line: 1, endLine: 1, column: 28, endColumn: 30 })],
    },
    {
      code: "var functionExpression = function(a, b) { return a && b; }",
      options: [0],
      errors: [message(1, { line: 1, endLine: 1, column: 26, endColumn: 34 })],
    },
    {
      code: `
      class A {
        method() {
          if (condition) {  // +1
            class B {}
          }
        }
      }`,
      options: [0],
      errors: [message(1, { line: 3, endLine: 3, column: 9, endColumn: 15 })],
    },
    {
      code: `
      class A {
        constructor() {
          if (condition) {}  // +1
        }
      }`,
      options: [0],
      errors: [message(1, { line: 3, endLine: 3, column: 9, endColumn: 20 })],
    },
    {
      code: `
      class A {
        set foo(x) {
          if (condition) {}  // +1
        }
        get foo() {
          if (condition) {}  // +1
        }
      }`,
      options: [0],
      errors: [
        message(1, { line: 3, endLine: 3, column: 13, endColumn: 16 }),
        message(1, { line: 6, endLine: 6, column: 13, endColumn: 16 }),
      ],
    },
    {
      code: `
      class A {
        ['foo']() {
          if (condition) {}  // +1
        }
      }`,
      options: [0],
      errors: [message(1, { line: 3, endLine: 3, column: 10, endColumn: 15 })],
    },
    {
      // here function is a function declaration, but it has no name (despite of the @types/estree definition)
      code: `
      export default function() {
        if (options) {}
      }`,
      options: [0],
      errors: [message(1, { line: 2, endLine: 2, column: 22, endColumn: 30 })],
    },

    // nested functions
    {
      code: `
      function nesting_func_no_complexity() {
        function nested_func() { // Noncompliant
          if (condition) {}      // +1
        }
      }`,
      options: [0],
      errors: [message(1, { line: 3 })],
    },
    {
      code: `
      function nesting_func_with_complexity() {  // Noncompliant
        if (condition) {}          // +1
        function nested_func() {   // (nesting level +1)
          if (condition) {}        // +2
        }
      }`,
      options: [0],
      errors: [message(3, { line: 2 })],
    },
    {
      code: `
      function nesting_func_with_not_structural_complexity() {  // Noncompliant
        return a && b;             // +1
        function nested_func() {   // Noncompliant
          if (condition) {}        // +1
        }
      }`,
      options: [0],
      errors: [message(1, { line: 2 }), message(1, { line: 4 })],
    },
    {
      code: `
      function two_level_function_nesting() {
        function nested1() {      // Noncompliant
          function nested2() {    // (nesting +1)
            if (condition) {}     // +2
          }
        }
      }`,
      options: [0],
      errors: [message(2, { line: 3 })],
    },
    {
      code: `
      function two_level_function_nesting_2() {
        function nested1() {     // Noncompliant
          if (condition) {}      // +1
          function nested2() {   // (nesting +1)
            if (condition) {}    // +2
          }
        }
      }`,
      options: [0],
      errors: [message(3, { line: 3 })],
    },
    {
      code: `
      function with_complexity_after_nested_function() { // Noncompliant
        function nested_func() {   // (nesting level +1)
          if (condition) {}        // +2
        }
        if (condition) {}          // +1
      }`,
      options: [0],
      errors: [message(3, { line: 2 })],
    },

    // spaghetti
    {
      code: `
      (function(a) {  // Noncompliant
        if (cond) {}
        return a;
      })(function(b) {return b + 1})(0);`,
      options: [0],
      errors: [message(1)],
    },
  ],
});

function message(complexity: number, other: Partial<RuleTester.TestCaseError> = {}) {
  return {
    message: `Refactor this function to reduce its Cognitive Complexity from ${complexity} to the 0 allowed.`,
    ...other,
  };
}
