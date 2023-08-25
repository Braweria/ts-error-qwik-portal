import type { ContextId, QRL, Signal } from "@builder.io/qwik";
import {
  $,
  Slot,
  component$,
  createContextId,
  useContextProvider,
  useSignal,
} from "@builder.io/qwik";
import { type JSXNode } from "@builder.io/qwik/jsx-runtime";

export type ContextPair<T> = { id: ContextId<T>; value: T };

export const PortalAPI =
  createContextId<
    QRL<
      (
        name: string,
        elementToTeleport: JSXNode,
        contexts?: Array<ContextPair<unknown>>
      ) => QRL<() => void>
    >
  >("PortalProviderAPI");

export const PortalCloseAPI =
  createContextId<QRL<() => void>>("PortalCloseAPI");

type Portal = {
  name: string;
  elementToTeleport: JSXNode;
  contexts: Array<ContextPair<unknown>>;
  close$?: QRL<() => void>;
};

const Portals = createContextId<Signal<Array<Portal>>>("Portals");

export const PortalProvider = component$(() => {
  const portals = useSignal<Portal[]>([]);
  useContextProvider(Portals, portals);

  // Provide the public API for the PopupManager for other components.
  useContextProvider(
    PortalAPI,
    $(
      (
        name: string,
        elementToTeleport: JSXNode,
        contexts?: ContextPair<unknown>[]
      ) => {
        const portal: Portal = {
          name,
          elementToTeleport,
          contexts: contexts || [],
        };
        portal.close$ = $(() => {
          portals.value = portals.value.filter(
            (currentPortalInfo) => currentPortalInfo !== portalInfo
          );
        });
        portal.contexts.push({ id: PortalCloseAPI, value: portal.close });
        portals.value = [...portals.value, portal];
        return portal.close$;
      }
    )
  );
  return <Slot />;
});
