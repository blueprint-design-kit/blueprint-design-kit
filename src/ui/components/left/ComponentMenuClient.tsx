'use client';

import { useEffect, useState } from 'react';
import BlueprintError from '../../../utils/BlueprintError.js';
import { getUrlParam, removeUrlParam, setUrlParam } from '../../utils/urlParam.js';

import type { ChangeEvent, ReactNode } from 'react';

const filterParamName = 'filter';

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

function renderNestedComponents(
    nested: NestedComponents,
    pathRoot: string,
    baseUrl: string,
    componentPath?: string,
    activeState?: {
        [key: string]: string | undefined;
    } | undefined,
): ReactNode {
    const items: ReactNode[] = [];
    Object.keys(nested).sort().forEach((key) => {
        if (key && key !== '__') {
            items.push(<details key={`dir_${key}`} open>
                <summary>{key}</summary>
                {renderNestedComponents(nested[key] as NestedComponents, `${pathRoot}/${key}`, baseUrl, componentPath, activeState)}
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

function filterListByQuery(items: string[], query?: string) {
    if (!query) return items;
    const queryLower = query.toLowerCase();
    return items.filter((item) => item.toLowerCase().includes(queryLower));
}

export type ComponentMenuProps = {
    componentList: string[];
    documentationList?: string[];
    componentPath?: string | undefined;
    baseUrl?: string | undefined;
    searchBar?: boolean | undefined;
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
    activeState,
}: ComponentMenuProps) {
    if (!componentList) {
        throw new BlueprintError('componentList is required');
    }
    if (!Array.isArray(componentList) || (componentList.length > 0 && typeof componentList[0] !== 'string')) {
        throw new BlueprintError('componentList must be an array of component names');
    }

    const filter = activeState && activeState[filterParamName];
    const [filteredComponents, setFilteredComponents] = useState(filterListByQuery(componentList, filter));
    const [filteredDocs, setFilteredDocs] = useState(filterListByQuery(documentationList, filter));

    const nestedComponents = nestSubdirectories(filteredComponents);

    function setSearchFilter(query: string) {
        setFilteredComponents(filterListByQuery(componentList, query));
        setFilteredDocs(filterListByQuery(documentationList, query));
    }

    function onFilterChange(event: ChangeEvent<HTMLInputElement>) {
        const query = event.currentTarget.value.toLowerCase();
        if (query) {
            setUrlParam(filterParamName, encodeURIComponent(query), true);
        } else {
            removeUrlParam(filterParamName, true);
        }
        setSearchFilter(query);
    }

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
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [componentPath]);

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
            <section className="blueprint-layout-component-menu">
                <div style={{ marginLeft: '-0.7em' }}>
                    <ul>
                        {renderNestedComponents(nestedComponents, '', baseUrl, componentPath, activeState)}
                    </ul>
                </div>
            </section>
        </>
    );
}
