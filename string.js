const array1 = [1, 4, 9, 16];

// Mutable instances is passed by reference.
// *Immutable instances is passed by value.
let result = array1.map(function (x) { // <--- callback
    return x *= 2;
});
console.log(array1);
console.log(result);

// arrow function
result = array1.map(x => x * 2);
result = array1.map((x) => { return x * 2 });
result = array1.map((x) => {
    if (!(x % 2)) { // ---> (x % 2 == 0) == !(x % 2)
        return x * 2;
    }
    return x;
});

console.log(result);

function a(x, y) {
    x(y); // <--- callback
}


a(function (y) {
    console.log('hello..' + y);
}, 'Na');


function x1(y) {
    console.log('hello X1' + y);
}
a(x1, 'Hanh');