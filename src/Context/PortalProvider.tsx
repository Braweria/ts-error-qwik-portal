import type { Component, ContextId, QRL, Signal } from '@builder.io/qwik';
import {
  $,
  Slot,
  component$,
  createContextId,
  useContextProvider,
  useSignal,
} from '@builder.io/qwik';
import { type JSXNode } from '@builder.io/qwik/jsx-runtime';

type PortalProviderContextType = {
  show: <T extends {}>(Component: Component<T>, props: T) => Promise<void>;
  hide: () => Promise<void>;
};

export const PortalProviderContext =
  createContextId<PortalProviderContextType>('PortalProvider');

export type ContextPair<T> = { id: ContextId<T>; value: T };

export const PortalAPI = createContextId<
  /**
   * Add JSX to a portal.
   * @param name portal name.
   * @param jsx to add.
   * @param contexts to add to the portal.
   * @returns A function used for closing the portal.
   */
  QRL<(name: string, jsx: JSXNode, contexts?: ContextPair<any>[]) => () => void>
>('PortalProviderAPI');

export const PortalCloseAPI =
  createContextId<QRL<() => void>>('PortalCloseAPI');

type Portal = {
  name: string;
  jsx: JSXNode;
  close: QRL<() => void>;
  contexts: Array<ContextPair<unknown>>;
};

const Portals = createContextId<Signal<Portal[]>>('Portals');

export const PortalProvider = component$(() => {
  const portals = useSignal<Portal[]>([]);
  useContextProvider(Portals, portals);

  // Provide the public API for the PopupManager for other components.
  useContextProvider(
    PortalAPI,
    $((name: string, jsx: JSXNode, contexts?: ContextPair<any>[]) => {
      const portal: Portal = {
        name,
        jsx,
        close: null!,
        contexts: [...(contexts || [])],
      };
      portal.close = $(() => {
        portals.value = portals.value.filter((p) => p !== portal);
      });
      portal.contexts.push({ id: PortalCloseAPI, value: portal.close });
      portals.value = [...portals.value, portal];
      return portal.close;
    })
  );
  return <Slot />;
});
