import { RuleTester } from "eslint";

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2017 } });
import rule = require("../../src/rules/no-use-of-empty-return-value");

const FUNCTION_NO_RETURN = "function noReturn() { }\n ";

ruleTester.run("no-use-of-empty-return-value", rule, {
  valid: [
    { code: "function withReturn() { return 1; } console.log(withReturn());" },
    { code: "let x = () => {}; if (cond) {x = () => 1} let y = x();" },
    { code: "var x = function x() { return 42 }; y = x();" },
    { code: FUNCTION_NO_RETURN + "noReturn();" },
    { code: FUNCTION_NO_RETURN + "async function foo() { await noReturn(); }" },
    { code: FUNCTION_NO_RETURN + "function foo() { return noReturn(); }" },
    { code: FUNCTION_NO_RETURN + "(noReturn());" },
    { code: FUNCTION_NO_RETURN + "let arrowFunc = p => noReturn();" },
    { code: FUNCTION_NO_RETURN + "let arrowFunc = p => (noReturn());" },
    { code: FUNCTION_NO_RETURN + "cond ? noReturn() : somethingElse();" },
    { code: FUNCTION_NO_RETURN + "boolVar && noReturn();" },
    { code: FUNCTION_NO_RETURN + "boolVar || noReturn();" },
    { code: "function noReturn() { return; }; noReturn();" },
    { code: "function withReturn() { return 42; }; x = noReturn();" },
    { code: "(function(){}());" },
    { code: "!function(){}();" },
    { code: "class A { methodNoReturn() {}\n foo() { console.log(this.methodNoReturn()); } }" }, // FN
    { code: "var arrowImplicitReturn = (a) => a*2;  x = arrowImplicitReturn(1);" },
    { code: "var arrowReturnsPromise = async () => {  var x = () => {return 1} };   x = arrowReturnsPromise();" },
    { code: "async function statementReturnsPromise() { var x = () => {return 1} }\n  x = statementReturnsPromise();" },
    { code: "function* noReturn() { yield 1; } noReturn().next();" },
    { code: "function* noReturn() { yield 1; } noReturn();" },
  ],
  invalid: [
    invalidPrefixWithFunction("console.log(noReturn());"),
    invalidPrefixWithFunction("x = noReturn();"),
    invalidPrefixWithFunction("noReturn() ? foo() : bar();"),
    invalidPrefixWithFunction("noReturn().foo();"),
    invalidPrefixWithFunction("let x = noReturn();"),
    invalidPrefixWithFunction("for (var x in noReturn()) { }"),
    invalidPrefixWithFunction("for (var x of noReturn()) { }"),
    invalidPrefixWithFunction("noReturn() && doSomething();"),
    invalid("var noReturn = function () { 1; }; console.log(noReturn());"),
    invalid("var noReturn = () => { 42;}; console.log(noReturn());"),
    invalid("function noReturn() { return; }; console.log(noReturn());"),
    invalid("var noReturn = function () { let x = () => { return 42 }; }; console.log(noReturn());"),
    invalid("var funcExpr = function noReturn () { 1; console.log(noReturn()); };"),
    invalid("var noReturn = () => { var x = () => {return 1}  }; x = noReturn();"),
  ],
});

function invalidPrefixWithFunction(
  code: string,
  functionName: string = "noReturn",
): { code: string; errors: RuleTester.TestCaseError[] } {
  return {
    code: "function noReturn() { 1;} " + code,
    errors: [
      { message: `Remove this use of the output from "${functionName}"; "${functionName}" doesn't return anything.` },
    ],
  };
}

function invalid(code: string): { code: string; errors: RuleTester.TestCaseError[] } {
  return {
    code: code,
    errors: [{ message: `Remove this use of the output from "noReturn"; "noReturn" doesn't return anything.` }],
  };
}
