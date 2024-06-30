import React from "react"
import { Meta, StoryFn } from "@storybook/react"
import { createGooglePlacesAdapter } from "../adapters"
import { createMapBoxAdapter } from "../adapters/map-box"
import { useAddressAutocomplete } from "../use-address-autocomplete"

type DemoProps = {
  adapter: "google" | "mapbox"
  googleApiKey?: string
  mapBoxApiKey?: string
}

const Demo = ({ adapter, googleApiKey, mapBoxApiKey }: DemoProps) => {
  const googlePlacesAdapter = createGooglePlacesAdapter(googleApiKey as string)
  const mapBoxAdapter = createMapBoxAdapter(mapBoxApiKey as string)

  const {
    value,
    setValue,
    ready,
    loadingSuggestions,
    suggestions,
    selectSuggestion,
    selectedAddress,
  } = useAddressAutocomplete(
    adapter === "google" ? googlePlacesAdapter : mapBoxAdapter
  )

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
      <label htmlFor={`autocomplete-${adapter}`}>{adapter}</label>
      <input
        id={`autocomplete-${adapter}`}
        value={value}
        onChange={handleInputChange}
        disabled={!ready}
      />
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
                textAlign: "left",
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

const meta: Meta = {
  title: "useAddressAutocomplete",
  component: Demo,
  argTypes: {
    googleApiKey: {
      description:
        "Google Places API Key (press the reload icon at the top after setting this)",
      control: {
        type: "text",
      },
    },
    mapBoxApiKey: {
      description:
        "MapBox API Key (press the reload icon at the top after setting this)",
      control: {
        type: "text",
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<DemoProps> = (args) => (
  <div style={{ display: "flex", gap: 16 }}>
    <Demo {...args} adapter="google" />
    <Demo {...args} adapter="mapbox" />
  </div>
)
export const Default = Template.bind({})
Default.args = {}
