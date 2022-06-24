function callback(x, y, z, cb) {
    const add = (a, b) => a + b;
    return setTimeout(() => {
        cb(add(x, y));
    }, z);
}

function a(x, y, z) {
    return new Promise((resolve, reject) => {
        callback(x, y, z, resolve);
    });
}


function a1(x, y, z) {
    return new Promise((resolve, reject) => {
        const add = (a, b) => a + b;
        setTimeout(() => {
            resolve(add(x, y));
        }, z);
    });
}


function main0(cb) {
    console.log('0. start');
    callback(3, 4, 3000, function (data) {
        console.log("3.then:: ", data);
        console.log('2. run');
        callback(5, 6, 1000, function (data) {
            console.log("4.then:: ", data);
            callback(1, 7, 500, function (data) {
                console.log("5.then:: ", data);
                callback(1, 8, 400, function (data) {
                    console.log("6.then:: ", data);
                    cb(data);
                });
            });
        });
    });
    console.log('10. end');
}

// then with promise hell
function main() {
    console.log('0. start');

    a(3, 4, 3000).then((response) => {
        console.log("3.then:: ", response);
        console.log('2. run');
        a(5, 6, 1000).then(data => {
            console.log("4.then:: ", data);
            a(1, 7, 500).then(data => {
                console.log("5.then:: ", data);
                a(1, 8, 400).then(data => console.log("6.then:: ", data));
            });
        });
    }).catch((error) => {
        console.log(error);
    });
    // a(1, 8, 400).then(data => console.log("6.then:: ", data));


    // console.log('2. run');
}

// then with chain
function main2() {
    console.log('0. start');

    a(3, 4, 3000)
        .then((response) => {
            console.log("3.then:: ", response);
            console.log('2. run');
        }).then(() => {
            return a(5, 6, 1000).then(data => {
                console.log("4.then:: ", data);
            });
        }).then(() => {
            return a(1, 7, 500).then(data => {
                console.log("5.then:: ", data);
            });
        }).then(() => {
            return a(1, 8, 400).then(data => console.log("6.then:: ", data));
        }).then(() => {
            console.log('10. end');
        })
        .catch((error) => {
            console.log(error);
        });
    // a(1, 8, 400).then(data => console.log("6.then:: ", data));
}


async function main3() { // async function will return promise
    try {
        console.log('0. start');
        let data = await a(3, 4, 3000);
        console.log("3.then:: ", data);
        console.log('2. run');
        let data1 = await a(5, 6, 1000);
        console.log("4.then:: ", data1);
        let data2 = await a(1, 7, 500);
        console.log("5.then:: ", data2);
        let data3 = await a(1, 8, 400);
        console.log("6.then:: ", data3);
        console.log('10. end');
        return data3;
    } catch (error) {
        console.log(error);
    }
}

async function main4() { // async function will return promise
    console.log('0. start');

    // paralel
    let data = await Promise.all([
        a(3, 4, 3000),
        a(5, 6, 1000),
        a(1, 7, 500),
        a(1, 8, 400),
    ]);

    console.log('10. end:: ', data);
}

// let x = main3();
// console.log("x:: ", x);

// main3().then((x) => console.log("x:: ", x));


// main0(function (x) {
//     console.log("x:: ", x)
// });

main4()