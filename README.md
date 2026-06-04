# blueprint-design-kit

> *A natural alternative to Storybook.*

### Manage your UI components like a pro!

- Define schemas, variants, and expectations for each component.
- Easily preview and showcase your components in your own app using our drop-in Blueprint UI.
- Test how each component renders against the expectations in your blueprint.
- Generate coverage reports.
- Run in CI.


## Install

```bash
npm install blueprint-design-kit
```


### 1) Add `blueprint` CLI commands to your package.json.

```json
// package.json
{
	"scripts": {
        "dev": "blueprint dev & next dev",
		"build": "blueprint build && next build",
        "test:ci": "blueprint test",
        "test": "blueprint test --serverCommand='npm run dev'",
	}
}
```

#### Available CLI Commands:
- `blueprint build` generates all of the necessary imports for your project then exits.
- `blueprint dev` watches files and automatically rebuilds when components or blueprints are updated.
- `blueprint test` builds and starts a dev server using the command of your choice, then runs Playwright in the background to test how each component renders against the expectations in your blueprints.
  - `test --serverCommand='npm run dev'` Command to be executed to build and start the server
  - `test --serverUrl='http://localhost:5000/my-bp'` The Url where your Blueprint UI lives
  - `test Atoms/Buttons` First positional argument will be used as a filter to match component paths


### 2) Create a `XXX.blueprint.tsx` file for one of your components

Example Component:
```tsx
// app/components/Badge.tsx
export default function Badge({ text, backgroundColor = '#f96' }) {
	return <div className="badge" style={{ backgroundColor }}>{text}</div>;
}
```

Corresponding Blueprint (matches the file name with `.blueprint`):
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
		NewProducts: {
			props: [
				{ text: 'New', backgroundColor: 'lavender' },
				{ text: 'New', backgroundColor: 'lightblue' },
				{ text: 'New', backgroundColor: 'honeydew' },
			],
		},
        'Logged-In': {
            props: { text: 'Hi, Sam' },
        },
	},
	links: [
		'https://figma.com/design/1234567890',
        'https://github.com/org/repo/blob/master/app/components/Badge.tsx',
	],
});

export default BadgeBlueprint;
```


### 3) Preview, explore, and test your components with Blueprint UI

Blueprint offers a pre-built UI which you can install and use out of the box...

### Follow our guide: [How to Use &lt;BlueprintDesignKitUI /&gt;](https://github.com/blueprint-design-kit/blueprint-design-kit/blob/main/src/ui/README.md) 🔗

![Blueprint UI](images/BlueprintUI.jpg)


### 4) [Optional] Add a `blueprint.config.ts` config file at your project root.
(Can alternatively use `.js` | `.cjs` | `.mjs` extensions where needed)

#### Click here to view [All available options and their defaults](https://github.com/blueprint-design-kit/blueprint-design-kit/blob/main/src/config/options.ts) 🔗

```ts
// blueprint.config.ts
import type { BlueprintSystemOptions } from 'blueprint-design-kit';

const blueprintOptions: BlueprintSystemOptions = {
	// see link to full config options above
};

export default blueprintOptions;
```

- By default, Blueprint scans `./app/components` as your components root directory and considers:
  - Blueprint files end in `.blueprint.(tsx|jsx|ts|js)`
  - Component files include all other `.(tsx|jsx)` files in your components root directory, except for files ending in `(.spec|.test|.mocks|.stories).(tsx|jsx)`
- The build script automatically logs warnings to the terminal for missing or invalid blueprints
- The build script generates a coverage report called `blueprint.coverage.json`
  - This is saved in the `.blueprint/` directory in your project root
- *You can override all of the above behaviors in `blueprint.config.ts`.*


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

Each prop in a schema can contain any of the following attributes (all optional):
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
        // This type means this prop is required and must be a string
        type: ['string'],
        // Allow means it should only accept one of these values
        allow: ['Limited', 'New', 'Most Popular'],
        // For debugging, what is the source of this data?
        source: 'https://cms.com/entries/5678',
    },
    backgroundColor: {
        // The default value is what is used when none is passed
        default: '#f96',
        // With undefined means this prop is optional, otherwise it should be a color
        type: ['color', 'undefined'],
    },
    price: {
        default: { amount: 0, currency: 'USD' },
        // For complex values, type can be a function that evaluates to true/false
        type: (value) => {
            if (value) {
                return typeof value.amount === 'number' && value.currency;
            }
            return true;
        },
        // Source can be given a more readable tag to describe the URL
        source: {
            tag: 'ProductCatalog',
            url: 'https://api.shopify.com/products/1234567890',
        },
    },
},
```

### variants:
Used for testing and to power the BlueprintUI showcase, the variants record describes some of the most common sets of props that will be passed to your component.

Each variant object can contain any of the following attributes:
- **props** (what values are passed as props)
- **expectation** (what the resulting dom should look like, as JSX)
- **state** (what initial values to use as state)
  - Note: This is an advanced feature. To be able to preview state in blueprints, your actual component must `import { useState, useReducer } from 'blueprint-design-kit/ui'` instead of from React.

An example variants object might look like this:
```tsx
// You can name your variants whatever you want by giving them unique keys
// Here we picked 'NewProducts', 'Logged-In', and 'Default'
variants: {
    NewProducts: {
        props: [
            { text: 'New', backgroundColor: '#f96' },
            { text: 'New', backgroundColor: 'lightblue' },
            { text: 'New', backgroundColor: 'honeydew' },
        ],
        // Expectation defines: given the props above, what is expected to be rendered
        expectation: (<>
            <div style={{backgroundColor: "#f96"}}>New</div>
            <div style={{backgroundColor: "lightblue"}}>New</div>
            <div style={{backgroundColor: "honeydew"}}>New</div>
        </>),
    },
    'Logged-In': {
        props: { text: 'Hi, Sam' },
        expectation: (
            <div style={{backgroundColor: "#f96"}}>Hi, Sam</div>
        ),
        state: { userName: 'Sam' },
    },
    Default: {
        // Shows how it will render when no props are passed
        expectation: (
            <div style={{backgroundColor: "#f96"}}>Default Text</div>
        ),
    },
},
```

### links:
An Array of hyperlinks associated with this specific component.

Links can usually be a simple string. Blueprint automatically detects some common types of links and uses smart icons. However, if you want to customize a link you can pass an object specifying a url, type, and icon.
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
Accepts a ReactNode/JSX for content that should be rendered alongside this component in the BlueprintUI showcase. Useful for keeping special instructions or links to other dependent components.

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

---
---
---
## DIY: Rendering components with custom tooling

If you need extra special customization ❄️, you can always access your blueprints programmatically to build your own tools or UI...

### Follow our guide: [How to Access Blueprints Programatically](https://github.com/blueprint-design-kit/blueprint-design-kit/blob/main/src/blueprint/README.md) 🔗

#### Example DIY Usage:

```ts
import { listComponents, getBlueprint, getComponent } from 'blueprint-design-kit';

const components = listComponents();
const componentPath = components[0];
const blueprint = await getBlueprint(componentPath);
const component = await getComponent(componentPath);
```

Enjoy your components and happy coding!
