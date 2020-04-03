import { nanoid } from 'https://cdn.jsdelivr.net/npm/nanoid/nanoid.js'


addEventListener('message', evt => {
    console.log('worker recieved message', evt)
    if(evt.data.numIds && evt.data.numIds > 0) {
        generateSomeIds(evt.data.numIds)
    }
})



        
var idChars = {};
var set = new Set();



function generateSomeIds(num ) {

    console.log("start making ids")

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
    //console.log(idChars)
    console.log("done making ids")
    postMessage({idCharDistributions: idChars, numGenerated: num, totalGenerated: set.size})
    console.log("posted message")

}