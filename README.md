# use-address-autocomplete

A generic hook to power address autocomplete UIs with any service for an UI / CSS framework.

## Demo

[Live Storybook Demo](https://jrdn91.github.io/use-address-autocomplete)

![](https://github.com/jrdn91/use-address-autocomplete/blob/main/use-address-autocomplete-demo.gif)

## Installation

Install the library

```shell
npm install use-address-autocomplete

yarn add use-address-autocomplete

pnpm add use-address-autocomplete

bun install use-address-autocomplete
```

That's it, you're ready to go (as long as you intend to use one of the built in adapters, detailed [below](#built-in-adapters))

## Usage

`useAddressAutocomplete` is intended to be used with any service and UI / CSS framework. To provide this API we use the concept of "adapters" to handle all the location service lookup logic and suggest via Types that data is returned in a common format. The basic usage can be seen in the storybook but here is the plainest example...

```tsx
import React from "react"
import useAddressAutocomplete from "use-address-autocomplete"
import { createGooglePlacesAdapter } from "use-address-autocomplete/adapters"

const googlePlacesAdapter = createGooglePlacesAdapter(
  "YOUR-GOOGLE-CLOUD-API-KEY"
)

const Demo = () => {
  const {
    value,
    setValue,
    loadingSuggestions,
    suggestions,
    selectSuggestion,
    selectedAddress,
  } = useAddressAutocomplete(googlePlacesAdapter)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "25%",
      }}
    >
      <label htmlFor="address">Search Address</label>
      <input id="addresss" value={value} onChange={handleInputChange} />
      {loadingSuggestions && <p>Loading suggestions...</p>}
      {suggestions.length > 0 && (
        <aside>
          {suggestions.map((suggestion) => (
            <button
              type="button"
              style={{
                background: "transparent",
                display: "block",
                border: "none",
              }}
              onClick={() => selectSuggestion(suggestion)}
              key={suggestion.id}
              data-test={suggestion}
            >
              {suggestion.text}
            </button>
          ))}
        </aside>
      )}
      {selectedAddress && (
        <section>
          <h2>Selected Address</h2>
          <pre>{JSON.stringify(selectedAddress, null, 2)}</pre>
        </section>
      )}
    </div>
  )
}
```

Here we use one of the built in adapter factories for Google Places, pass it our API key and pass the resulting Google Places Adapter into the hook. Out of the hook we get our suggestions and selected address data as well as some functions to allow us to control it.

Under the hood the adapter is doing all the work for getting suggestions as well as returning the address object with the expected data.

With this setup, we can swap out the adapter very easily. Here is an example with the built in MapBox adapter...

```tsx
...
import { createMapBoxAdapter } from "use-address-autocomplete/adapters"

const mapBoxAdapter = createMapBoxAdapter(
  "YOUR-MAP-BOX-API-KEY"
)

const {
    value,
    setValue,
    loadingSuggestions,
    suggestions,
    selectSuggestion,
    selectedAddress,
  } = useAddressAutocomplete(mapBoxAdapter)
```

The API is the same and the data you get back, while maybe formatted slightly differently, matches the same general shape, no changes to your UI needs to be made.

## API

```tsx
const addressAutocomplete = useAddressAutocomplete(adapter, options)
```

When using `useAddressAutocomplete`, an adapter is required. You can configure the following options via the options object.

### Options

| Key            | Type   | Default | Description          |
| -------------- | ------ | ------- | -------------------- |
| `debounceTime` | number | 1000    | The debounce timeout |

### Return Props

| Key                  | Type                                            | Default | Description                                                                                                                                            |
| -------------------- | ----------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ready`              | boolean                                         | false   | Gets set to true when the adapters `init` promise resolves and the hook is ready to be used                                                            |
| `value`              | string                                          | ""      | The value to hold in your input                                                                                                                        |
| `setValue`           | function(newValue: string)                      |         | A function that takes the new value from your inputs onChange event                                                                                    |
| `loadingSuggestions` | boolean                                         | false   | Boolean that gets set to true as soon as `setValue` passes an initial value and gets set to false when the adapters `getSuggestions` promise completes |
| `suggestions`        | [Suggestion](#suggestion)[]                     | []      | The array that gets populated with suggestions from the adapters `getSuggestions` promise return value                                                 |
| `selectSuggestion`   | function(suggestion: [Suggestion](#suggestion)) |         | The function that should be called when the user clicks on one of the suggestions returned from the `suggestions` prop                                 |
| `selectedAddress`    | [AddressComponents](#address-omponents)         | null    | The final address components object that includes all address parts, place id, and location object                                                     |

---

### Built in Adapters

An adapter is an object with a couple functions that handle making the necessary API calls to the defined service to return suggestions as well as full address components and latitude + longitude.

This library comes with two built in adapters for Google Places and for MapBox. I've exposed them via factory functions that allow to pass your specific API key as well as any options that will get passed to the respective API calls.

---

### Google Places Adapter

```ts
createGooglePlacesAdapter(apiKey, options)
```

> The Google Places Adapter uses the [Places API (New)](https://developers.google.com/maps/documentation/places/web-service/op-overview) And thus requires that you enable the 'Places API (New) in the Google Cloud Console. [More info](https://developers.google.com/maps/documentation/places/web-service/cloud-setup#enabling-apis)

| Argument  | Type                  | Default | Description                                                    |
| --------- | --------------------- | ------- | -------------------------------------------------------------- |
| `apiKey`  | string                |         | The API key that will be used under the hood to make API calls |
| `options` | [Options](#options-1) |         | Options to control some aspects of Google Places API lookups   |

#### Options

| Argument                   | Type                                                        | Default | Description                                                                                                                                                                                                  |
| -------------------------- | ----------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `suggestRequestOptions`    | [GoogleSuggestRequestOptions](#googlesuggestrequestoptions) |         | Some of the [autocomplete options](https://developers.google.com/maps/documentation/places/web-service/place-autocomplete#optional-parameters) passed as body params to the autocomplete endpoint, see below |
| `componentsRequestOptions` | [ComponentsRequestOptions](#componentsrequestoptions)       |         | Some of the [place details options](https://developers.google.com/maps/documentation/places/web-service/place-details#optional-parameters) passed to the place details endpoint                              |

#### GoogleSuggestRequestOptions

| Key                                      | Type                                    | Default | Description                                                                                                                 |
| ---------------------------------------- | --------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| `includeRegionCodes`                     | string[]                                |         | [Details](https://developers.google.com/maps/documentation/places/web-service/place-autocomplete#included-region-codes)     |
| `languageCode`                           | string                                  |         | [Details](https://developers.google.com/maps/documentation/places/web-service/place-autocomplete#language)                  |
| `origin`                                 | { latitude: number, longitude: number } |         | [Details](https://developers.google.com/maps/documentation/places/web-service/place-autocomplete#origin)                    |
| `regionCode`                             | string                                  |         | [Details](https://developers.google.com/maps/documentation/places/web-service/place-autocomplete#region)                    |
| `locationBias` or `locationRestrictions` | Record<string, any>                     |         | [Details](https://developers.google.com/maps/documentation/places/web-service/place-autocomplete#location-bias-restriction) |

#### ComponentsRequestOptions

| Key            | Type   | Default | Description                                                                                               |
| -------------- | ------ | ------- | --------------------------------------------------------------------------------------------------------- |
| `languageCode` | string |         | [Details](https://developers.google.com/maps/documentation/places/web-service/place-details#languagecode) |
| `regionCode`   | string |         | [Details](https://developers.google.com/maps/documentation/places/web-service/place-details#regioncode)   |

---

### MapBox Search Box Adapter

```ts
createMapBoxAdapter(apiKey, options)
```

| Argument  | Type                  | Default | Description                                                      |
| --------- | --------------------- | ------- | ---------------------------------------------------------------- |
| `apiKey`  | string                |         | The API key that will be used under the hood to make API calls   |
| `options` | [Options](#options-2) |         | Options to control some aspects of MapBox Search Box API lookups |

#### Options

| Argument                 | Type                                                        | Default | Description                                                                                                                                             |
| ------------------------ | ----------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `suggestRequestOptions`  | [MapBoxSuggestRequestOptions](#mapboxsuggestrequestoptions) |         | The [suggest optional options](https://docs.mapbox.com/api/search/search-box/#interactive-search) passed as a query string to the autocomplete endpoint |
| `retrieveRequestOptions` | [RetrieveRequestOptions](#retrieverequestoptions)           |         | The [retrieve optional options](https://docs.mapbox.com/api/search/search-box/#retrieve-a-suggested-feature) passed to the retrieve endpoint            |

#### MapBoxSuggestRequestOptions

| Key                       | Type                                  | Default | Description                                                                     |
| ------------------------- | ------------------------------------- | ------- | ------------------------------------------------------------------------------- |
| `bbox`                    | string                                |         | [Details](https://docs.mapbox.com/api/search/search-box/#get-suggested-results) |
| `country`                 | string                                |         | [Details](https://docs.mapbox.com/api/search/search-box/#get-suggested-results) |
| `eta_type`                | string                                |         | [Details](https://docs.mapbox.com/api/search/search-box/#get-suggested-results) |
| `language`                | string                                |         | [Details](https://docs.mapbox.com/api/search/search-box/#get-suggested-results) |
| `limit`                   | string                                |         | [Details](https://docs.mapbox.com/api/search/search-box/#get-suggested-results) |
| `navigation_profile`      | `"driving" \| "walking" \| "cycling"` |         | [Details](https://docs.mapbox.com/api/search/search-box/#get-suggested-results) |
| `origin`                  | string                                |         | [Details](https://docs.mapbox.com/api/search/search-box/#get-suggested-results) |
| `poi_category`            | string                                |         | [Details](https://docs.mapbox.com/api/search/search-box/#get-suggested-results) |
| `pot_category_exclusions` | string                                |         | [Details](https://docs.mapbox.com/api/search/search-box/#get-suggested-results) |
| `proximity`               | string                                |         | [Details](https://docs.mapbox.com/api/search/search-box/#get-suggested-results) |
| `route`                   | string                                |         | [Details](https://docs.mapbox.com/api/search/search-box/#get-suggested-results) |
| `route_geometry`          | string                                |         | [Details](https://docs.mapbox.com/api/search/search-box/#get-suggested-results) |
| `time_deviation`          | string                                |         | [Details](https://docs.mapbox.com/api/search/search-box/#get-suggested-results) |
| `types`                   | string                                |         | [Details](https://docs.mapbox.com/api/search/search-box/#get-suggested-results) |

#### RetrieveRequestOptions

| Key              | Type   | Default | Description                                                                            |
| ---------------- | ------ | ------- | -------------------------------------------------------------------------------------- |
| `language`       | string |         | [Details](https://docs.mapbox.com/api/search/search-box/#retrieve-a-suggested-feature) |
| `attribute_sets` | string |         | [Details](https://docs.mapbox.com/api/search/search-box/#retrieve-a-suggested-feature) |

---

### Types

#### Suggestion

A suggestion can take extra props that the adapter may want to include, these become a part of each suggestion object

```ts
type Suggestion<OtherPropsType extends Record<string, any> = {}> = {
  id: string
  text: string
} & OtherPropsType
```

#### AddressComponents

An address component can take extra props that the adapter may want to include, these become part of each suggestion object

```ts
type AddressComponents<OtherPropsType extends Record<string, any> = {}> = {
  address1: string
  address2: string
  city: string
  country: string
  id: string
  location: {
    latitude: number
    longitude: number
  }
  postalCode: string
  state: string
} & OtherPropsType
```

#### Adapter

The adapter type should be used when creating a custom adapter [(outlined below)](#creating-custom-adapters)

The adapter should contain three functions, one for loading suggestions from the search value, one for getting full address components and location object, and one for initializing anything the adapter may need, such as instantiating an SDK class.

```ts
type Adapter<
  SuggestionOtherProps extends Record<string, any> = {},
  AddressComponentsOtherProps extends Record<string, any> = {},
> = {
  getAddressComponents: (
    suggestion: Suggestion<SuggestionOtherProps>
  ) => Promise<AddressComponents<AddressComponentsOtherProps>>
  getSuggestions: (query: string) => Promise<Suggestion<SuggestionOtherProps>[]>
  init: () => Promise<void>
} & Record<string, any>
```

---

### Creating custom adapters

As outlined via the types above, an adapter is simply an object containing a handful of functions for initializing, fetching and returning suggestions and fetching and returning full address + geo information.

This library provides two factories for creating a Google Places and a MapBox autocomplete adapter.

Your adapter does not need to follow the factory pattern for your own uses but if you would like to make the adapter
available for others to use and have it linked below in the [Community Adapters](#community-adapters) section, the factory pattern is advised because it allows the user to pass in options specific to the service implementation very easily and know they are always getting an adapter that conforms to the required formatting and can handle any options they so choose to use.

Here is an example adapter to make requests to your own database via an API call

```ts
const myAdapter: Adapter = {
  init: () =>
    // we don't need any special initialization here
    Promise.resolve(),
  getSuggestions: (query) =>
    fetch(
      `https://your-api-service.domain/some-suggestion-endpoint?query=${query}`
    )
      .then((res) => res.json())
      .then((response) =>
        response.suggestions.map((returnedSuggestion) => ({
          id: returnedSuggestion.id,
          text: returnedSuggestion.full_address,
        }))
      ),
  getAddressComponents: (suggestion) =>
    fetch(
      `https://your-api-service.domain/some-address-endpoint?suggestionId=${suggestion.id}`
    )
      .then((res) => res.json())
      .then((response) => ({
        address1: response.address1,
        address2: response.address2,
        city: response.city,
        country: response.country,
        id: response.id,
        location: {
          latitude: response.latitude,
          longitude: response.longitude,
        },
        postalCode: response.postalCode,
        state: response.state,
        // You can add any other properties you need here
        companyName: response.companyName,
      })),
}
```

The only properties that are necessary for suggestions are `id` and `text`. You can add more properties if you need them for your UI or other business logic. An address similarly only needs the properties defined above in the [AddressComponents](#AddressComponents) type but you can add any other properties you need there as well.

If your adapter is defining other properties and you would like type definitions for your IDE, the Adapter takes in generics, defined on the [Adapter type](#adapter) and these extra properties will now have type hinting in your IDE. If you make an adapter intended for the community to use and you include other properties that are necessary for the use of that adapter you should set these generics so users of your adapter will know they have them available.

#### Creating a factory

While not strictly necessary, a factory is strongly recommended for community adapters you intend others to use (I'll prefer them when reviewing PR's to add new community adapters to the list [below](#community-adapters)).

A factory is simply a function that returns a new object "encoded" with specific arguments passed in when it's "instantiated". [Read about factories](https://www.patterns.dev/vanilla/factory-pattern/)

To create a factory for the example above:

```ts
const createMyAdapter = (options: { limit: string }): Adapter => ({
  init: () =>
    // we don't need any special initialization here
    Promise.resolve(),
  getSuggestions: (query) =>
    fetch(
      `https://your-api-service.domain/some-suggestion-endpoint?query=${query}&limit=${options.limit}`
    )
      .then((res) => res.json())
      .then((response) =>
        response.suggestions.map((returnedSuggestion) => ({
          id: returnedSuggestion.id,
          text: returnedSuggestion.full_address,
        }))
      ),
  getAddressComponents: (suggestion) =>
    fetch(
      `https://your-api-service.domain/some-address-endpoint?suggestionId=${suggestion.id}`
    )
      .then((res) => res.json())
      .then((response) => ({
        address1: response.address1,
        address2: response.address2,
        city: response.city,
        country: response.country,
        id: response.id,
        location: {
          latitude: response.latitude,
          longitude: response.longitude,
        },
        postalCode: response.postalCode,
        state: response.state,
        // You can add any other properties you need here
        companyName: response.companyName,
      })),
})

// usage
const myAdapter = createMyAdapter({ limit: "10" })
```

In this way, a user of your adapter could create multiple instances of your adapter with different sets of options, or API keys (if your adapter used them) for different purposes in their app. ie: they have one place in their app for full address search and another in their app for just City and State search.

---

### Community Adapters

If you've made an adapter that you think the community would like to use, feel free to make a PR here linking to your own adapter.

Be sure to follow the practices [above](#creating-custom-adapters) and strongly prefer to follow the factory pattern for the reasons detailed [above](#creating-a-factory)

> None yet, why don't you make one and submit a PR to add it! :star_struck:
