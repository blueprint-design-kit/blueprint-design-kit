# How to Access Blueprints Programatically

```ts
import {
    getBlueprint,
    getComponent,
    getComponentMeta,
    listComponents,
} from 'blueprint-design-kit';

const components = listComponents();
const componentPath = components[0].name;
const blueprint = await getBlueprint(componentPath);
const component = await getComponent(componentPath);
const { useClient } = await getComponentMeta(componentPath);
```

#### -> listComponents()
Returns an Array of components. Each component has a `path` property that corresponds to your directory structure. For example:
```ts
const components = listComponents();
// [{ path: 'Atoms/Badge', path: 'Atoms/Badge' }, { path: 'Atoms/Button', path: 'Atoms/Button' }, ...]
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

(Pro tip: use [this page](https://github.com/blueprint-design-kit/blueprint-design-kit/blob/main/src/ui/index.tsx) for reference when building your own UI)

Enjoy your components and happy coding!
