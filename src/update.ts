import {Update, Query, int, UpdateAsync, CanisterResult} from 'azle';


let counter: int = BigInt(0);
export function count(): Query<int> {
    
    return counter;
}

export function tick(): Update<void> {
    console.log("Ticked!!!!")
    counter = counter + BigInt(1);
}
