let theJson = {
    "DATA": [{ "id": 11, "name": "ajax", "subject": "OR", "mark": 63 },
    { "id": 12, "name": "javascript", "subject": "OR", "mark": 63 },
    { "id": 13, "name": "jquery", "subject": "OR", "mark": 63 },
    { "id": 14, "name": "ajax", "subject": "OR", "mark": 63 },
    { "id": 15, "name": "jquery", "subject": "OR", "mark": 63 },
    { "id": 16, "name": "ajax", "subject": "OR", "mark": 63 },
    { "id": 20, "name": "ajax", "subject": "OR", "mark": 63 }], "COUNT": "120"
}
function theJsonHW() {

    let data = theJson['DATA']
    let res = []
    let checkSame = {}

    for (let item of data) {
        if (!checkSame[item.name]) { checkSame[item.name] = item.mark }
        else {
            checkSame[item.name] = checkSame[item.name] + item.mark
        }
    }
    console.log(checkSame);

    for (let item in checkSame) {
        let tempRes = { "name": item, "total": checkSame[item] }
        res.push(tempRes);
    }

    console.log(res)
}
theJsonHW()

