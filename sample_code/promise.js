const p = new Promise(function(resolve, reject) {
    // Kick off some async work
    // ...
    // Value or an error
    resolve(1); // Success. Return 1
    reject(new Error('message'));
});

const p1 = new Promise((resolve) => {
    setTimeout(() => {
        console.log("Async operation 1...")
        resolve(1);
    }, 10000);
});

const p2 = new Promise((resolve, reject) => {
    setTimeout(() => {
        console.log("Async operation 2...")
        // reject(new Error('Error'));
        resolve(2)
    }, 1000);
});
function x() {
    return new Promise((resolve, reject) => {
        resolve(1);
    }) 
}
Promise.race([p1, p2])
    .then(result => console.log(result))
    .catch(err => console.log("Error occured", err));
