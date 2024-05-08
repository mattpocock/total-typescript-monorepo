```tsx
// 1. Declare your Zustand state
type State = {
  bears: number;
  increasePopulation: (num: number) => void;
};

// 2. Declare a function which creates your store
const getStore = (initialState: { bears: number }) => {
  return createStore<State>()((set) => ({
    bears: initialState.bears,
    increasePopulation: (by) =>
      set((state) => ({
        bears: state.bears + by,
      })),
  }));
};

// 3. Create your Zustand context
const BearStuff = createZustandContext(getStore);
```

```tsx
const App = () => {
  return (
    // 4. Use your provider with the initial
    // value from getStore
    <BearStuff.Provider
      initialValue={{
        bears: 1,
      }}
    >
      My App
    </BearStuff.Provider>
  );
};
```
