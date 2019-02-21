var a = 0
setTimeout(
    () => {
        a++
        console.log("HOLAAA",a, new Date().getTime())
    },
    2000
);