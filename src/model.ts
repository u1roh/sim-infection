
type SpotKind = "school" | "company" | "train" | "home" | "public";

export interface Spot {
    kind: SpotKind;
    people: Person[];
}

export interface Behavior {
    nextSpot(time: number, region: Region): Spot | "home";
}

function createStudentBehavior(school: Spot): Behavior {
    return {
        nextSpot: (time: number, region: Region) => {
            switch (time % 6) {
                case 0: case 1:
                    return school;
                case 2:
                    return region.randomPublicSpot();
                default:
                    return "home";
            }
        }
    };
}

function createWorkderBehavior(company: Spot, commuterLine: Spot): Behavior {
    return {
        nextSpot: (time: number, region: Region) => {
            if (time % 6 < 4) {
                const rand = Math.random();
                if (rand < 0.5) {
                    return company;
                } else if (rand < 0.75) {
                    return commuterLine;
                } else {
                    return region.randomPublicSpot();
                }
            } else {
                return "home";
            }
        }
    }
}

function createOtherBehavior(): Behavior {
    return {
        nextSpot: (time: number, region: Region) => {
            if (time % 6 < 2) {
                const kind = Math.random() < 0.5 ? "train" : "public";
                return region.randomSpot(kind);
            } else {
                return "home";
            }
        }
    }
}

class Person {
    private home: Spot;
    private behavior: Behavior;
    private infection: null | number = null;
    constructor(behavior: Behavior, home: Spot) {
        this.home = home;
        this.behavior = behavior;
        this.infection = null;
    }
    move(time: number, region: Region) {
        const spot = this.behavior.nextSpot(time, region);
        ((spot === "home") ? this.home : spot).people.push(this);
        if (this.infection != null && this.infection > 0) {
            --this.infection;
        }
    }
    isInfected() {
        return this.infection != null && this.infection > 0;
    }
    isSusceptible() {
        return this.infection == null;
    }
    infect(period: number) {
        this.infection = period;
    }
}

class Region {
    spots: Map<SpotKind, Spot[]>;
    constructor(spots: Map<SpotKind, Spot[]>) {
        this.spots = spots;
    }
    randomSpot(kind: SpotKind) {
        const a = this.spots.get(kind);
        if (a !== undefined) {
            return a[Math.floor(a.length * Math.random())];
        } else {
            return "home";
        }
    }
    randomPublicSpot() {
        return this.randomSpot("public");
    }
}

export class Simulator {
    private time: number = 0;
    private region: Region;
    private population: Person[] = [];
    private infectionProbability = 0.001;
    private infectionPeriod = 6 * 10;   // 10 days
    private infectionN: number;
    constructor(familyN: number, initialInfectionN: number) {
        const companyN = Math.ceil(familyN / 100);
        const schoolN = Math.ceil(familyN / 500);
        const trainN = Math.ceil(familyN / 10000);
        const publicN = Math.ceil(familyN / 10);
        console.log("familyN = " + familyN);
        console.log("companyN = " + companyN);
        console.log("schoolN = " + schoolN);
        console.log("trainN = " + trainN);
        console.log("publicN = " + publicN);
        const companies = new Array<Spot>();
        const schools = new Array<Spot>();
        const trains = new Array<Spot>();
        const publics = new Array<Spot>();
        const homes = new Array<Spot>();
        for (let i = 0; i < companyN; ++i) companies.push({ kind: "company", people: [] });
        for (let i = 0; i < schoolN; ++i) schools.push({ kind: "school", people: [] });
        for (let i = 0; i < trainN; ++i) trains.push({ kind: "train", people: [] });
        for (let i = 0; i < publicN; ++i) publics.push({ kind: "public", people: [] });
        function genWorker(home: Spot) {
            return new Person(createWorkderBehavior(
                companies[Math.floor(companyN * Math.random())],
                trains[Math.floor(trainN * Math.random())]
            ), home)
        }
        function genStudent(home: Spot) {
            return new Person(createStudentBehavior(
                schools[Math.floor(schoolN * Math.random())],
            ), home)
        }
        for (let i = 0; i < familyN; ++i) {
            const home: Spot = { kind: "home", people: [] };
            const workerN = 1 + Math.round(Math.random());
            const studentN = Math.floor(3 * Math.random());
            const otherN = Math.floor(3 * Math.random());
            for (let i = 0; i < workerN; ++i) home.people.push(genWorker(home));
            for (let i = 0; i < studentN; ++i) home.people.push(genStudent(home));
            for (let i = 0; i < otherN; ++i) home.people.push(new Person(createOtherBehavior(), home));
            for (let p of home.people) { this.population.push(p); }
            homes.push(home);
        }
        for (let i = 0; i < initialInfectionN; ++i) {
            const index = Math.floor(this.population.length * Math.random());
            this.population[index].infect(this.infectionPeriod);
        }
        const spots = new Map<SpotKind, Spot[]>();
        spots.set("company", companies);
        spots.set("school", schools);
        spots.set("train", trains);
        spots.set("public", publics);
        spots.set("home", homes);
        this.region = new Region(spots);
        this.infectionN = initialInfectionN;
    }
    step() {
        this.infectionN = 0;
        //console.log("(1) this.infectionN = " + this.infectionN);
        this.region.spots.forEach((spots: Spot[], _: SpotKind) => {
            for (const spot of spots) {
                // infection
                const infectionN = spot.people.filter(p => p.isInfected()).length;
                const infectionProb = 1.0 - Math.pow(1.0 - this.infectionProbability, infectionN);
                for (const p of spot.people) {
                    if (p.isSusceptible() && Math.random() < infectionProb) {
                        p.infect(this.infectionPeriod);
                    }
                }
                // clear people in spot
                spot.people.length = 0;
                // count up infectionN
                this.infectionN += infectionN;
            }
        });
        //console.log("(2) this.infectionN = " + this.infectionN);
        // move people
        for (let p of this.population) {
            p.move(this.time, this.region);
        }
        // increment time
        ++this.time;
    }
    getInfectionN() {
        return this.infectionN;
    }
    getInfectionRate() {
        return this.infectionN / this.population.length;
    }
    getDay() {
        return this.time / 6;
    }
}