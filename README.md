# blueprint-design-kit
Manage UI components like a pro.

- Define schemas, variants, and expectations for each component.
- Generate coverage reports.
- Install [blueprint-design-kit-ui](https://github.com/blueprint-design-kit/blueprint-design-kit-ui) for a pre-built a component explorer, or easily customize your own.

## Install

```bash
npm install blueprint-design-kit
```

## Quick Start

### 1) Add the Blueprint CLI to your package.json.

Use `--watch` in dev mode to automatically rebuild blueprints when files are updated.

```json
{
	"scripts": {
		"build": "blueprint && next build",
        "dev": "blueprint --watch & next dev"
	}
}
```

### 2) Go to one of your UI components and create a matching `[COMPONENT].blueprint.tsx` file.

Example Component:
```tsx
// app/components/Badge.tsx
export default function Badge({ text, backgroundColor = '#f96' }) {
	return <div className="badge" style={{ backgroundColor }}>{text}</div>;
}
```

Example Blueprint:
```tsx
// app/components/Badge.blueprint.tsx
import { Blueprint } from 'blueprint-design-kit';

const BadgeBlueprint = new Blueprint({
	schema: {
        text: {
            type: ['string'],
        },
		backgroundColor: {
			default: '#f96',
			type: ['color', 'undefined'],
		},
	},
	variants: {
        DEFAULT: {
            props: { text: 'Some Text Here' },
        },
		NewProducts: {
			props: [
				{ text: 'New', backgroundColor: 'lavender' },
				{ text: 'New', backgroundColor: 'lightblue' },
				{ text: 'New', backgroundColor: 'honeydew' },
			],
		},
	},
	links: [
		'https://figma.com/design/1234567890',
        'https://github.com/org/repo/blob/master/app/components/Badge.tsx',
	],
});

export default BadgeBlueprint;
```

### 3) Run the CLI to generate your blueprints.

To build once:
```bash
npm run build
```
Or to keep blueprints updated while you develop:
```bash
npm run dev
```
Running `blueprint` from command line scripts will create a .blueprint folder at your project root with:

- `blueprint.imports.js` - dynamic import map for your components and blueprints
- `blueprint.coverage.json` - coverage report (if enabled)

It also logs warnings to the terminal for missing blueprints or invalid blueprints based on your config.

### 4) [Optional] Add a `blueprint.config.ts` config file at your project root.
(Can alternatively use `.js` | `.cjs` | `.mjs` extensions where needed)

```ts
// blueprint.config.ts
import type { BlueprintSystemOptions } from 'blueprint-design-kit';

const blueprintOptions: BlueprintSystemOptions = {
	... link to config options below
};

export default blueprintOptions;
```
Click here to view [all available options and their defaults](https://github.com/blueprint-design-kit/blueprint-design-kit/blob/main/src/config/options.ts)


## Component discovery rules (defaults)

By default Blueprint scans `./app/components` as your components root directory and considers:

- Blueprint files end in `.blueprint.(tsx|jsx|ts|js)`
- Component files include all other `.(tsx|jsx)` files in your components root directory, except for files ending in `(.spec|.test|.mocks|.stories).(tsx|jsx)`

You can override all of these settings in `blueprint.config.ts`.


## Properties of a blueprint file

Let's talk about what goes inside of a blueprint...

```tsx
new Blueprint({
	schema: { ... },
    variants: { ... },
    links: [ ... ],
    notes: <>...</>,
    locales: { ... },
});
```

### schema:
As a required property, the schema is the most important. This record defines what props the component accepts and will be used in validations.

Each prop in a schema can contain any of the following attributes:
- **type** (what types of values are allowed)
- **allow** (what specific values are allowed)
- **default** (what value will be used if none is passed)
- **source** (what is the source of this data)
- **min** (what is the minimum allowed value)
- **max** (what is the maximum allowed value)

For a component that takes `text`, `backgroundColor`, and `price`, the schema might look like this:
```ts
schema: {
    text: {
        type: ['string'], // this prop is required and must be a string
        allow: ['Limited Time', 'New', 'Most Popular'], // should only accept one of these values
        source: 'https://cms.com/entries/5678', // what is the source of this data?
    },
    backgroundColor: {
        default: '#f96', // value used when none is passed
        type: ['color', 'undefined'], // this prop is optional, but should be a color value
    },
    price: { // for complex values, type can be a function that evaluates to true/false
        default: { amount: 0, currency: 'USD' },
        type: (value) => {
            if (value) {
                return typeof value.amount === 'number' && value.currency;
            }
            return true;
        },
        source: { // source can be given a tag to describe the URL
            tag: 'ProductCatalog',
            url: 'https://api.shopify.com/products/1234567890',
        },
    },
},
```

### variants:
Used for validations and to power a UI showcase, the variants record describes some of the most common configurations that will be passed to your component.

Each variant object can contain any of the following attributes:
- **props** (what values are passed as props)
- **expectation** (what the resulting dom should look like, as JSX)
- **state** (what initial values to use as state)
  - Note: This is an advanced feature. To be able to preview state in blueprints, your component must consume these values from a special prop called `state` and pass them into `useState()` hooks as initial values.

An example variants object might look like this:
```tsx
// You can name your variants whatever you want by giving them unique keys
variants: {
    DEFAULT: { // Only needed if you have required props
        props: { text: 'Some Text Here' },
        expectation: ( // Given the props above, what is expected to be rendered
            <div style={{borderRadius: 30, padding: 10, backgroundColor: "#f96"}}>Some Text Here</div>
        ),
    },
    NewProducts: {
        props: [
            { text: 'New', backgroundColor: '#f96' },
            { text: 'New', backgroundColor: 'lightblue' },
            { text: 'New', backgroundColor: 'honeydew' },
        ],
        expectation: (<>
            <div style={{borderRadius: 30, padding: 10, backgroundColor: "#f96"}}>Most Popular</div>
            <div style={{borderRadius: 30, padding: 10, backgroundColor: "lightblue"}}>Most Popular</div>
            <div style={{borderRadius: 30, padding: 10, backgroundColor: "honeydew"}}>Most Popular</div>
        </>),
    },
    'Logged-In': {
        props: { text: 'Hi, Sam' },
        expectation: (
            <div style={{borderRadius: 30, padding: 10, backgroundColor: "#f96"}}>Hi, Sam</div>
        ),
        state: { userName: 'Sam' },
    },
},

// DEFAULT is special variant name for what should be displayed when no props are passed. The default state of the component will automatically exist for every component even when this variant is not explicitly passed, but you should specify a DEFAULT variant here when you need to pass some required props even to the default state, etc. Configure the `strictDefaults` option to deermine if passing props to DEFAULT fails validations or not.
```

### links:
An Array of hyperlinks associated with this specific component.

Links can be a simple string or an object specifying a type and icon.
```tsx
links: [
    'https://figma.com/design/1234567890',
    'https://github.com/org/repo/blob/master/app/components/Badge.tsx',
    {
        url: 'http://anydomain.com/foo',
        type: 'MyCustomLink',
        icon: <svg>...</svg>,
    },
],
```

### notes:
Accepts a ReactNode/JSX for content that should be rendered alongside this component. Useful for keeping special instructions or links to other dependent components.

```tsx
notes: (
    <div>
        <h2>Badge Notes</h2>
        <p>This comonent is deprecated. Use <a href="/other">other component</a> instead.</p>
    </div>
),
```

### locales:
Use this feature to override the blueprint configuration just for a specific locale. Any properties that you do not specifically override will fall back to the default configuration. Pass in the current locale when using Blueprint instance functions such as `getVariant`, `getLinks`, etc.

```tsx
locales: {
    'en-GB': {
        variants: { ... },
        links: [ ... ],
        notes: <>...</>,
    },
    'fr-FR': {
        variants: { ... },
        links: [ ... ],
        notes: <>...</>,
    },
},
```


## Rendering components with Blueprint UI

Blueprint offers a pre-built [blueprint-design-kit-ui](https://github.com/blueprint-design-kit/blueprint-design-kit-ui) which you can install and use out of the box...

### Basic usage:
```tsx
import BlueprintDesignKitUI from 'blueprint-design-kit-ui';

export default async function BlueprintShowcase({ params, searchParams }) {
	const urlParams = await params;
	const urlSearchParams = await searchParams;
    const componentPath = decodeURIComponent((urlParams.component || []).join('/'));
    const locale = decodeURIComponent(urlParams.locale || '');
    const options = {};
	return (
		<BlueprintDesignKitUI
            componentPath={componentPath}
            locale={locale}
			urlSearchParams={urlSearchParams}
            options={options}
		/>
	);
}
```

---
## DIY Rendering components with custom tooling

However, if you need extra customization, you can always access your blueprints programmatically...

(Pro tip: use [this page](https://github.com/blueprint-design-kit/blueprint-design-kit-ui/blob/main/src/index.tsx) for reference when building your own UI)

### Example DIY Usage:

```ts
import { listComponents, getBlueprint, getComponent } from 'blueprint-design-kit';

const components = listComponents();
const componentPath = components[0];
const blueprint = await getBlueprint(componentPath);
const component = await getComponent(componentPath);
```

#### -> listComponents()
Returns an Array of componentPaths that corresponds to your directory structure. For example:
```ts
const components = listComponents();
// [ 'Atoms/Badge', 'Atoms/Button' ]
```

#### -> getBlueprint(componentPath: string) (async)
Returns a Blueprint instance for the specified component.
```ts
const locale = 'en-US';
const blueprint = await getBlueprint('Atoms/Badge');
blueprint.getLinks(locale), // [ 'http://foo.com/Badge' ]
blueprint.getNotes(locale), // <h1>Notes</h1>
blueprint.getSchema(locale), // { text: { type: 'string' }, backgroundColor: { default: '#f96' } }
blueprint.listVariants(), // [ 'DEFAULT', 'NewProducts', 'Logged-In' ]
blueprint.getVariant('Logged-In', locale), // { props: { text: 'Hi, Sam' } }
```

#### -> getComponent(componentPath: string) (async)
Returns your actual component, ready for rendering
```tsx
const FunctionComponent = await getComponent('Atoms/Badge');
return <FunctionComponent {...props} />
```

#### -> getComponentMeta(componentPath: string) (async)
Returns an object that describes the meta attributes of a component. Currently only contains a boolean indicating if the component has the `'use client'` or `'use server'` directive at the top.
```ts
const componentMetaData = await getComponentMeta('Atoms/Badge');
// { useClient: true, useServer: false }
```

---
---

...

Enjoy your components and happy coding!
