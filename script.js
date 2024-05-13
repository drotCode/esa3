document.getElementById("devBordersButton").addEventListener("click", (e) => {
    document.querySelectorAll("body *").forEach((el) => {
        el.classList.toggle("devBorders")
    })
})
const elClasses = []
const el = Object.fromEntries(elClasses.map(cls => [cls, document.querySelector("." + cls)]))
const toggleHidden = (element) => { element.classList.toggle("hidden") }
/* ---------- ---------- ---------- -------- ---------- ---------- ---------- */
const paramInstances = []
const paramWords = ["hgb", "hgbDate", "kg", "ert", "ertPk", "drb", "drbPk", "fer", "ferDate",]
const inputWords = ["number", "range", "date",]
class Param {
    postFns = [];
    inputs = {}
    runPostFns() { this.postFns.forEach((fn) => fn()) }
    constructor(name, value = undefined, options = undefined, attributes = undefined) {
        this.name = name;
        this.options = options;
        this.attributes = attributes;

        inputWords.forEach((word) => { this.inputs[word] = document.querySelector(`input[type=${word}].${name}`) })

        this.inputs.all = Object.values(this.inputs)

        this.outputs = Object.assign({}, this.inputs)
        this.outputs.texts = document.querySelectorAll(`.paramtext.${name}`)

        this.outputs.all = [...this.inputs.all, ...this.outputs.texts]
        this.inputs.all.forEach(input => {
            for (const attr in attributes) { input?.setAttribute(attr, attributes[attr]) }
            input?.addEventListener("input", (e) => { this.setValue(e.target.value) })
        });
        this.setValue(value)
        paramInstances.push(this)
    }
    setValue(x) {
        if(this.name == "hgbDate" || this.name == "ferDate") {
           return this.outputs.texts.forEach((text) => {
            text.innerText =  x.split("-").reverse().join(".")
        })}
        if (this.value == x ) { return }
        if (Number.isNaN(x) ) { return console.log("Nani!") }
        x = Number.isNaN(x - 0) ? x : (x - 0);
        this.value = x;



        if (this.options?.decimals) { x = x.toFixed(this.decimals) }
        this.outputs.all.forEach((output) => { if (output) { output.value = output.innerText = x } })
        this.runPostFns()
    }

}

let day = 1000 * 60 * 60 * 24
let date = new Date()
let currentDate = date.toISOString().slice(0, 10)
let sixMonthsB4 = new Date(date - 180 * day).toISOString().slice(0,10)

let hgb = new Param("hgb", 10, undefined, { min: 5, max: 12, step: 0.1})
let hgbDate = new Param("hgbDate", currentDate, undefined, { min: sixMonthsB4, max: currentDate })
let kg = new Param("kg", 50, { decimals: 2 }, { min: 20, max: 150, step: 0.5})
let ert = new Param("ert", 7500, { decimals: 2 }, { min: 75 * 20, max: 150 * 150, step: 75})
let ertPk = new Param("ertPk", 150, undefined, { min: 75, max: 150, step: 75})
let drb = new Param("drb", 37.5, { decimals: 4 }, { min: 0.35, max: 0.75 * 150, step: 0.35})
let drbPk = new Param("drbPk", 0.75, undefined, { min: 0.35, max: 0.75, step: 0.40})
let fer = new Param("fer", 0, undefined, { min: 1, max: 1500, step: 1})
let ferDate = new Param("ferDate", currentDate,undefined,{ min: sixMonthsB4, max: currentDate })


const updateDoses = () => {
    ert.setValue(ertPk.value * kg.value)
    drb.setValue(drbPk.value * kg.value)
}

const hgbToPk = () => {
    ertPk.setValue(hgb.value < 11 ? 150 : 75)
    drbPk.setValue(hgb.value < 11 ? 0.75 : 0.35)
    updateDoses()
}

hgb.postFns.push(hgbToPk)

kg.postFns.push(updateDoses)

ert.postFns.push(() => kg.setValue(ert.value / ertPk.value))
drb.postFns.push(() => kg.setValue(drb.value / drbPk.value))

// for (const param of paramInstances) {
//     console.log(param.name,param.inputs.date);
// }