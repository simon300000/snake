let pi = "3•1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989"
let score = new ReactiveVar(Array())
score.v = 0
let direction = new ReactiveVar(undefined)
let directionCache = undefined
let pause = new ReactiveVar(false)
let grid = new ReactiveVar(Array(32))
let border = new ReactiveVar(true)
let speed = new ReactiveVar(2)
let blankLocation

let pendingFunction
let timeout
let start
let step

function init() {
    for (let x = 0; x < grid.get().length; x++) {
        grid.get()[x] = Array()
        for (let y = 0; y < grid.get().length; y++) {
            grid.get()[x].push({
                x: x,
                y: y,
                show: undefined,
                color: 'white',
                font: 'black'
            })
        }
    }

blankLocation = [10, 10]
pendingFunction = []
start = false
step = []

    for (let i = 0; i < 11; i++) {
        let location = random()
        grid.get()[location[0]][location[1]].show = i
        if (i == 10) {
            grid.get()[location[0]][location[1]].show = '•'
        }
    }
}

init()


Template.main.helpers({
    grid: () => grid.get(),
    border: () => {
        return border.get() && 'border'
    },
    isBorder: () => {
        return border.get() && 'success' || 'danger'
    },
    speed: () => {
        if (pause.get()) {
            return 'stop'
        }
        return speed.get()
    },
    score:()=>{
      return score.get().length
    },
});

Template.main.events({
    'click #border': e => {
        border.set(!border.get())
    },
    'click #speed': e => {
        speed.set(speed.get() + 1)
        if (speed.get() == 4) {
            speed.set(1)
        }
    },
    'click #restart': e => {
        score.set(Array())
        score.v = 0
        grid.set(Array(32))
        init()
        direction.set(undefined)
        pause.set(false)
    },
});

window.onkeydown = e => {
    e.preventDefault()
    e.stopPropagation()
    switch (e.keyCode) {
        case 87:
        case 38:
            direction.set("u")
            break;
        case 83:
        case 40:
            direction.set("d")
            break;
        case 65:
        case 37:
            direction.set("l")
            break;
        case 68:
        case 39:
            direction.set("r")
            break;
        default:
    }
    start = true
}

function move(location, order) {
    let locationTaget = [location[0], location[1]]
    if (score.get()[order + 1] != undefined) {
        return [score.get()[order + 1][0], score.get()[order + 1][1]]
    }
    switch (directionCache) {
        case 'u':
            locationTaget[1]--
                break;
        case 'd':
            locationTaget[1]++
                break;
        case 'l':
            locationTaget[0]--
                break;
        case 'r':
            locationTaget[0]++
                break;
        default:
    }
    if (locationTaget[0] < 0) {
        locationTaget[0] = grid.get().length - 1
    } else if (locationTaget[0] == grid.get().length) {
        locationTaget[0] = 0
    } else if (locationTaget[1] < 0) {
        locationTaget[1] = grid.get().length - 1
    } else if (locationTaget[1] == grid.get().length) {
        locationTaget[1] = 0
    }
    return locationTaget
}

function random() {
    let location = [parseInt(Math.random() * 32 % 32), parseInt(Math.random() * 32 % 32)]
    if (score.get().length == 0) {
        while (location[0] == blankLocation[0] || location[1] == blankLocation[1] || grid.get()[location[0]][location[1]].show != undefined) {
            location = [parseInt(Math.random() * 32 % 32), parseInt(Math.random() * 32 % 32)]
        }
    } else {
        while (location[0] == score.get()[score.get().length - 1][0] || location[1] == score.get()[score.get().length - 1][1] || grid.get()[location[0]][location[1]].show != undefined) {
            location = [parseInt(Math.random() * 32 % 32), parseInt(Math.random() * 32 % 32)]
        }
    }
    return location
}

function eat(location) {
    score.v++
        if (grid.get()[location[0]][location[1]].color == 'black') {
            grid.get()[location[0]][location[1]].color = 'red'
            pause.set(true)
            return true
        } else
    if (grid.get()[location[0]][location[1]].show != pi[score.get().length]) {
        grid.get()[location[0]][location[1]].color = 'red'
        pause.set(true)
        return false
    } else {
        if (pi[score.get().length] != '•') {
            let addLocation = random()
            grid.get()[addLocation[0]][addLocation[1]].show = pi[score.get().length]
        }
        if (score.get().length == 0) {
            score.get().push(location)
        }
        return false
    }
}

const update = () => {
    if (timeout && (new Date()).getTime() - timeout > 400 && start) {
        pause.set(true)
    }
    timeout = (new Date()).getTime()
    if (pause.get() == false) {
        if (score.get().length < 2) {
            directionCache = direction.get()
        } else if (!((directionCache == 'u' && direction.get() == 'd') || (directionCache == 'd' && direction.get() == 'u') || (directionCache == 'l' && direction.get() == 'r') || (directionCache == 'r' && direction.get() == 'l'))) {
            directionCache = direction.get()
        }
        while (0 < pendingFunction.length) {
            pendingFunction.shift()()
        }
        if (score.get().length == 0) {
            let locationHere = move(blankLocation, 0)
            blankLocation = [locationHere[0], locationHere[1]]

            if (grid.get()[locationHere[0]][locationHere[1]].show != undefined && grid.get()[locationHere[0]][locationHere[1]].show != '?') {
                eat(locationHere)
                if (score.get().length != 0) {
                    grid.get()[locationHere[0]][locationHere[1]].show = pi[score.get().length - 1]
                    grid.get()[locationHere[0]][locationHere[1]].color = 'black'
                    grid.get()[locationHere[0]][locationHere[1]].font = 'white'
                }
            } else {
                grid.get()[locationHere[0]][locationHere[1]].show = '?'
                grid.get()[locationHere[0]][locationHere[1]].color = 'black'
                grid.get()[locationHere[0]][locationHere[1]].font = 'white'
            }
            pendingFunction.push(() => {
                grid.get()[locationHere[0]][locationHere[1]].show = undefined
                grid.get()[locationHere[0]][locationHere[1]].color = 'white'
                grid.get()[locationHere[0]][locationHere[1]].font = 'black'
            })

        } else {
            step = [score.get()[0][0], score.get()[0][1]]
            let length = score.get().length
            for (let i = 0; i < length; i++) {
                score.get()[i] = move(score.get()[i], i)

                if (grid.get()[score.get()[i][0]][score.get()[i][1]].show != undefined || grid.get()[score.get()[i][0]][score.get()[i][1]].color == 'black' && i == score.get().length - 1) {
                    if (eat(score.get()[i])) {
                        grid.get()[score.get()[i][0]][score.get()[i][1]].show = pi[i]
                    } else {
                        if (pause.get()) {
                            score.get().pop()
                        } else {
                            grid.get()[score.get()[i][0]][score.get()[i][1]].color = 'black'
                        }
                        score.get().unshift([step[0], step[1]])
                        grid.get()[score.get()[0][0]][score.get()[0][1]].color = 'black'
                    }
                } else {
                    grid.get()[score.get()[i][0]][score.get()[i][1]].color = 'black'
                }
            }
            for (let i = 0; i < score.get().length; i++) {
                if (pi[i] == '•') {
                    grid.get()[score.get()[i][0]][score.get()[i][1]].show = '.'
                } else {
                    grid.get()[score.get()[i][0]][score.get()[i][1]].show = pi[i]
                }
                grid.get()[score.get()[i][0]][score.get()[i][1]].font = 'white'

                pendingFunction.push(() => {
                    grid.get()[score.get()[i][0]][score.get()[i][1]].show = undefined
                    grid.get()[score.get()[i][0]][score.get()[i][1]].color = 'white'
                    grid.get()[score.get()[i][0]][score.get()[i][1]].font = 'black'
                })
            }
        }
    }
    grid._dep.changed()
    score._dep.changed()
    setTimeout(update, 300 / speed.get());
}
update()
