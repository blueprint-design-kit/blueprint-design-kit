'use client';

import { useEffect, useState } from 'react';
import BlueprintError from '../../../utils/BlueprintError.js';
import LocalStorage from '../../../utils/localStorage.js';
import { getUrlParam, removeUrlParam, setUrlParam } from '../../utils/urlParam.js';
import collapseAll from '../../icons/collapseAll.js';
import expandAll from '../../icons/expandAll.js';
import hasBlueprint from '../../icons/hasBlueprint.js';

import type { ChangeEvent, ReactNode } from 'react';
import type { ComponentListItem } from '../../../blueprint/listComponents.js';

const filterParamName = 'filter';

interface LocalState {
    nonBpHidden?: boolean;
    expandAll?: boolean;
}

const localStorage = new LocalStorage<LocalState>('ComponentMenu');

interface NestedComponents {
    [key: string]: NestedComponents | string[];
    __: string[]; // components directly under this level
}

function nestSubdirectories(componentList: string[]) {
    const result: NestedComponents = { __: [] };

    for (const component of componentList) {
        const parts = component.split('/');

        if (parts.length === 1) {
            // No subdirectory, add to root
            result.__.push(component);
        } else {
            // Has subdirectories
            let current = result;

            // Navigate through all parts except the last one
            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i] as string;
                if (!current[part]) {
                    current[part] = { __: [] };
                }
                current = current[part] as NestedComponents;
            }

            // Add the component name to the __ array at this level
            const componentName = parts[parts.length - 1];
            if (componentName) {
                current.__.push(componentName);
            }
        }
    }

    return result;
}

// nested: {
//     __: ['Component1', 'Component2'],
//     Client: {
//         __: ['Component3', 'Component4'],
//         Atoms: {
//             __: ['Component5', 'Component6'],
//         },
//     },
// }
function renderNestedComponents(
    nested: NestedComponents,
    pathRoot: string,
    baseUrl: string,
    componentPath?: string,
    allExpanded?: boolean,
    activeState?: {
        [key: string]: string | undefined;
    } | undefined,
): ReactNode {
    const items: ReactNode[] = [];
    Object.keys(nested).sort().forEach((key) => {
        if (key && key !== '__') {
            items.push(<details key={`dir_${key}`} open={!!allExpanded}>
                <summary>{key}</summary>
                {renderNestedComponents(nested[key] as NestedComponents, `${pathRoot}/${key}`, baseUrl, componentPath, allExpanded, activeState)}
            </details>);
        }
    });
    if (Array.isArray(nested.__) && nested.__.length > 0) {
        nested.__.sort().forEach((component) => {
            const searchParams = typeof window === 'undefined' ?
                new URLSearchParams(activeState as Record<string, string>)
                : new URL(window.location.href).searchParams;
            searchParams.delete('variant'); // Should not carry variant when switching components
            const searchParamsString = searchParams.toString();
            const urlPath = `${baseUrl}${pathRoot}/${component}`;
            const fullUrl = `${urlPath}${searchParamsString ? `?${searchParamsString}` : ''}`;
            items.push(<li id={urlPath} key={`li_${component}`} className='blueprint-component-menu-filterable'>
                <a href={fullUrl} className={`${pathRoot}/${component}` === `/${componentPath}` ? 'selected-component' : ''}>
                    {component}
                </a>
            </li>);
        });
    }
    return items;
}

function onKeyDown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        const searchInput = document.getElementById('blueprint_component_menu_search') as HTMLInputElement | null;
        if (searchInput) {
            event.preventDefault();
            searchInput.focus();
        }
    }
}

function isValidComponentList(list: unknown): list is ComponentListItem[] {
    if (!Array.isArray(list)) {
        return false;
    }
    for (const item of list) {
        if (!item || typeof item.path !== 'string') {
            return false;
        }
    }
    return true;
}

function filterComponents(items: ComponentListItem[], query?: string, nonBpHidden?: boolean) {
    let filteredItems = items;
    if (nonBpHidden) {
        filteredItems = filteredItems.filter((item) => item.meta && item.meta.hasBlueprint);
    }
    if (query) {
        const queryLower = query.toLowerCase();
        filteredItems = filteredItems.filter((item) => item.path.toLowerCase().includes(queryLower));
    }
    return filteredItems.map((item) => item.path);
}

function filterDocs(items: string[], query?: string) {
    if (!query) return items;
    const queryLower = query.toLowerCase();
    return items.filter((item) => item.toLowerCase().includes(queryLower));
}

export type ComponentMenuProps = {
    componentList: ComponentListItem[];
    documentationList?: string[];
    componentPath?: string | undefined;
    baseUrl?: string | undefined;
    searchBar?: boolean | undefined;
    startExpanded?: boolean | undefined;
    startNonBlueprintHidden?: boolean | undefined;
    activeState?: {
        filter?: string | undefined;
    } | undefined;
}

export function ComponentMenuClient({
    componentList,
    documentationList = [],
    componentPath,
    baseUrl = '/blueprint',
    searchBar = true,
    startExpanded = false,
    startNonBlueprintHidden = false,
    activeState,
}: ComponentMenuProps) {
    if (!componentList) {
        throw new BlueprintError('componentList is required');
    }
    if (!isValidComponentList(componentList)) {
        throw new BlueprintError('componentList must be an array of components with {path, meta}');
    }

    const [nonBpHidden, setNonBpHidden] = useState(!!startNonBlueprintHidden);
    const [allExpanded, setAllExpanded] = useState(!!startExpanded);

    const filter = activeState && activeState[filterParamName];
    const [filteredComponents, setFilteredComponents] = useState(filterComponents(componentList, filter, nonBpHidden));
    const [filteredDocs, setFilteredDocs] = useState(filterDocs(documentationList, filter));

    const nestedComponents = nestSubdirectories(filteredComponents);

    function setSearchFilter(query: string) {
        setFilteredComponents(filterComponents(componentList, query, nonBpHidden));
        setFilteredDocs(filterDocs(documentationList, query));
    }

    function onFilterChange(event: ChangeEvent<HTMLInputElement>) {
        const query = event.currentTarget.value.toLowerCase();
        console.log('onFilterChange', query);
        if (query) {
            setUrlParam(filterParamName, encodeURIComponent(query), true);
        } else {
            removeUrlParam(filterParamName, true);
        }
        setSearchFilter(query);
    }

    function expandParentTree(element: HTMLElement) {
        const parent = element.parentElement;
        if (parent && parent.nodeName === 'DETAILS') {
            const parentDetails = parent as HTMLDetailsElement;
            parentDetails.open = true;
            expandParentTree(parentDetails);
        }
    }

    function toggleExpandAll() {
        localStorage.update('expandAll', !allExpanded);
        setAllExpanded(() => !allExpanded);
    }

    function toggleNonBpHidden() {
        localStorage.update('nonBpHidden', !nonBpHidden);
        setNonBpHidden(() => !nonBpHidden);
    }

    useEffect(() => {
        const localState: LocalState = localStorage.get() || {};
        if (typeof localState.expandAll === 'boolean') {
            setAllExpanded(localState.expandAll);
        }
        if (typeof localState.nonBpHidden === 'boolean') {
            setNonBpHidden(localState.nonBpHidden);
        }
    }, []);

    useEffect(() => {
        setSearchFilter(filter || ''); // Calling here also applies nonBpHidden state
    }, [filter, nonBpHidden]);

    useEffect(() => {
        const searchInput = document.getElementById('blueprint_component_menu_search') as HTMLInputElement | null;
        if (searchInput) {
            let query = getUrlParam(filterParamName);
            query = query ? decodeURIComponent(query) : '';
            searchInput.value = query;
        }
        if (componentPath) {
            const element = document.getElementById(`${baseUrl}/${componentPath}`);
            if (element) {
                expandParentTree(element);
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    });

    return (
        <>
        {!!searchBar &&
            <section className="blueprint-layout-component-menu-search">
                <div style={{ margin: '0 0 0.5em 0.6em' }}>
                    <input id='blueprint_component_menu_search' type='search' placeholder='Filter... ⌘K' autoComplete="off" onChange={onFilterChange} />
                </div>
            </section>
        }
        {filteredDocs.length > 0 &&
            <section className="blueprint-layout-component-menu-docs">
                <div style={{ marginLeft: '-0.7em' }}>
                    <ul>
                        {filteredDocs.map((name) => (
                            <li key={name}>
                                <a href={`${baseUrl}/${name}`} className={componentPath === name ? 'selected-component' : ''}>
                                    {name.replaceAll('/', ' / ')}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        }
            <div className="blueprint-layout-component-menu-icons">
                <div
                    className="blueprint-layout-component-menu-icon"
                    title={nonBpHidden ? 'Show all components' : 'Hide components without blueprints'}
                    data-status={nonBpHidden ? 'active' : ''}
                    onClick={toggleNonBpHidden}>
                    {hasBlueprint.icon}
                </div>
                <div
                    className="blueprint-layout-component-menu-icon"
                    title={allExpanded ? collapseAll.label : expandAll.label}
                    data-status={allExpanded ? 'active' : ''}
                    onClick={toggleExpandAll}>
                    {allExpanded ? collapseAll.icon : expandAll.icon}
                </div>
            </div>
            <section className="blueprint-layout-component-menu">
                {componentList.length === 0 && <div style={{
                    margin: '0 0 0 1.5em',
                    fontStyle: 'italic',
                    fontSize: '13px',
                    color: '#ccc',
                }}>--<br />No components found</div>}
                <div style={{ marginLeft: '-0.7em' }}>
                    <ul>
                        {renderNestedComponents(nestedComponents, '', baseUrl, componentPath, allExpanded, activeState)}
                    </ul>
                </div>
            </section>
        </>
    );
}
