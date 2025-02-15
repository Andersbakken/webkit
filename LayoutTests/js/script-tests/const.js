description(
"This test checks that const declarations in JavaScript work and are readonly."
);


shouldThrow("const redef='a'; const redef='a';");

const x = "RIGHT";
x = "WRONG";
shouldBe("x", '"RIGHT"');

const z = "RIGHT", y = "RIGHT";
y = "WRONG";
shouldBe("y", '"RIGHT"');

const one = 1;

var a;

// PostIncResolveNode
a = one++;
shouldBe("a", "1");
shouldBe("one", "1");

// PostDecResolveNode
a = one--;
shouldBe("a", "1");
shouldBe("one", "1");

// PreIncResolveNode
a = ++one;
shouldBe("a", "2");
shouldBe("one", "1");

// PreDecResolveNode
a = --one;
shouldBe("a", "0");
shouldBe("one", "1");

// ReadModifyConstNode
a = one += 2;
shouldBe("a", "3");
shouldBe("one", "1");

// AssignConstNode
a = one = 2;
shouldBe("a", "2");
shouldBe("one", "1");

// PostIncResolveNode
shouldBe("function f() { const one = 1; one++; return one; } f();", "1");
shouldBe("function f() { const oneString = '1'; return oneString++; } f();", "1");
shouldBe("function f() { const one = 1; return one++; } f();", "1");

// PostDecResolveNode
shouldBe("function f() { const one = 1; one--; return one; } f();", "1");
shouldBe("function f() { const oneString = '1'; return oneString--; } f();", "1");
shouldBe("function f() { const one = 1; return one--; } f();", "1");

// PreIncResolveNode
shouldBe("function f() { const one = 1; ++one; return one; } f();", "1");
shouldBe("function f() { const one = 1; return ++one; } f();", "2");

// PreDecResolveNode
shouldBe("function f() { const one = 1; --one; return one; } f();", "1");
shouldBe("function f() { const one = 1; return --one; } f();", "0");

// ReadModifyConstNode
shouldBe("function f() { const one = 1; one += 2; return one; } f();", "1");
shouldBe("function f() { const one = 1; return one += 2; } f();", "3");

// AssignConstNode
shouldBe("function f() { const one = 1; one = 2; return one; } f();", "1");
shouldBe("function f() { const one = 1; return one = 2; } f();", "2");

// PostIncResolveNode
shouldBe("one++", "1");
shouldBe("one", "1");

// PostDecResolveNode
shouldBe("one--", "1");
shouldBe("one", "1");

// PreIncResolveNode
shouldBe("++one", "2");
shouldBe("one", "1");

// PreDecResolveNode
shouldBe("--one", "0");
shouldBe("one", "1");

// ReadModifyConstNode
shouldBe("one += 1", "2");
shouldBe("one", "1");

// AssignConstNode
shouldBe("one = 2", "2");
shouldBe("one", "1");

var object = { inWith1: "RIGHT", inWith2: ""}
with (object) {
    const inWith1 = "WRONG";
    const inWith2 = "RIGHT";
    inWith2 = "WRONG";
}
shouldBe("object.inWith1", "'RIGHT'");
shouldBe("inWith2", "'RIGHT'");

shouldBe("(function(){ one = 2; return one; })()", "1")
var f = function g() { g="FAIL"; return g; };
shouldBe("f()", "f");

shouldBe("const a;", "undefined");

// Make sure that dynamic scopes (catch, with) don't break const declarations
function tryCatch1() {
    var bar;
    eval("try {\
        stuff();\
    } catch (e) {\
        const bar = 5;\
    }");
    return bar;
}

function tryCatch2() {
    var bar;
    try {
        stuff();
    } catch (e) {
        const bar = 5;
    }
    return bar;
}

tryCatch1Result = tryCatch1();
shouldBe("tryCatch1Result", "5");
tryCatch2Result = tryCatch2();
shouldBe("tryCatch2Result", "5");

function with1() {
    var bar;
    eval("with({foo:42}) const bar = 5;");
    return bar;
}

function with2() {
    var bar;
    with({foo:42}) const bar = 5;
    return bar;
}

with1Result = with1();
shouldBe("with1Result", "5");
with2Result = with2();
shouldBe("with2Result", "5");

(function () {
    function shouldBe(aDescription, a, b)
    {
        if (a === b) {
            testPassed("PASS: " + aDescription + " should be " + b + " and is.");
            return;
        }

        testFailed("FAIL: " + aDescription + " should be " + b + " but instead is " + a + ".");
    }

    (function() {
        const x = "1";
        shouldBe("++x", ++x, 2);
        shouldBe("--x", --x, 0);
        shouldBe("x", x, "1");
        shouldBe("x++", x++, 1);
        shouldBe("x", x, "1");
    })();
    (function() {
        const x = 1;
        shouldBe("++x", ++x, 2);
        shouldBe("x", x, 1);
        shouldBe("x++", x++, 1);
        shouldBe("x", x, 1);
    })();
})();
