class NameManager {
	private namesPool: string[];
	private usedNames: Set<string>;

	constructor(names: string[]) {
		this.namesPool = [...names];
		this.usedNames = new Set();
	}

	getName(): string {
		if (this.namesPool.length === 0) {
			return 'John' + this.usedNames + 1; // No more names available
		}
		const name = this.namesPool.pop()!;
		this.usedNames.add(name);
		return name;
	}

	putName(name: string): void {
		if (this.usedNames.has(name)) {
			this.usedNames.delete(name);
			this.namesPool.push(name);
		} else {
			throw new Error(`Name "${name}" was not in use.`);
		}
	}
}

// Usage example
const namesPool: string[] = [
	'John',
	'Mary',
	'James',
	'Patricia',
	'Robert',
	'Jennifer',
	'Michael',
	'Linda',
	'William',
	'Elizabeth',
	'David',
	'Barbara',
	'Richard',
	'Susan',
	'Joseph',
	'Jessica',
	'Thomas',
	'Sarah',
	'Charles',
	'Karen',
];

export const nameManager = new NameManager(namesPool);
