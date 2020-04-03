
// borrowed from https://github.com/ai/nanoid
function nanoid_string() {
    let id = '',
        size = 21,
        bytes = crypto.getRandomValues(new Uint8Array(size))

    // A compact alternative for `for (var i = 0; i < step; i++)`.
    while (size--) {
        // It is incorrect to use bytes exceeding the alphabet size.
        // The following mask reduces the random byte in the 0-255 value
        // range to the 0-63 value range. Therefore, adding hacks, such
        // as empty string fallback or magic numbers, is unneccessary because
        // the bitmask trims bytes down to the alphabet size.
        let byte = bytes[size] & 63
        if (byte < 36) {
        // `0-9a-z`
        id += byte.toString(36)
        } else if (byte < 62) {
        // `A-Z`
        id += (byte - 26).toString(36).toUpperCase()
        } else if (byte < 63) {
        id += '_'
        } else {
        id += '-'
        }
    }
    return id
}

function nanoid_array() {
    let id = [],
        size = 21,
        bytes = crypto.getRandomValues(new Uint8Array(size))

    // A compact alternative for `for (var i = 0; i < step; i++)`.
    while (size--) {
        // It is incorrect to use bytes exceeding the alphabet size.
        // The following mask reduces the random byte in the 0-255 value
        // range to the 0-63 value range. Therefore, adding hacks, such
        // as empty string fallback or magic numbers, is unneccessary because
        // the bitmask trims bytes down to the alphabet size.
        let byte = bytes[size] & 63
        if (byte < 36) {
        // `0-9a-z`
        id.push( byte.toString(36) )
        } else if (byte < 62) {
        // `A-Z`
        id.push((byte - 26).toString(36).toUpperCase())
        } else if (byte < 63) {
        id.push( '_')
        } else {
        id.push('-')
        }
    }
    return id.join('')
}
// above 2 methods don't seem to make much difference in memory usage or time. 
// probalby prefer string concat version since it is fewer bytes of JS. 
var nanoid = nanoid_string;

console.log(self)

addEventListener('message', evt => {
    console.log('worker recieved message', evt)
    if(evt.data.numIds && evt.data.numIds > 0) {
        //setTimeout(() => {
        generateSomeIds(evt.data.numIds)
        //},0)
    }
})



        
var idChars = {};
var set = new Set();



function generateSomeIds(num ) {

    var start = performance.now()
    console.log("start making ids", start)

    for(let count = 1; count <= num; count++) {


        let id = nanoid();

        if(!set.has(id)) {
            set.add(id)
        } else {
            console.log("collision!", id, set.length)
        }


        for(let idx = 0; idx < id.length; idx++) {
            let char = id[idx];

            if(!idChars[char]){
                idChars[char] = 1;
            } else {
                idChars[char] += 1;
            }

        }

        // if(num > 500 && count % 500 === 0) {
        //     postMessage({idCharDistributions: idChars, numGenerated: count, totalGenerated: set.size})
        // }



    }
    var done = performance.now();
    console.log("done making ids", start,done, done-start)
    postMessage({idCharDistributions: idChars, numGenerated: num, totalGenerated: set.size})
    console.log("posted message")

}