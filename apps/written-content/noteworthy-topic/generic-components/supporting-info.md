```tsx twoslash
const Table = <T extends Record<string, any>>(props: {
  rows: T[];
  renderRow: React.FC<T>;
}) => {
  return (
    <table>
      <tbody>
        {props.rows.map((row) => (
          <props.renderRow {...row} />
        ))}
      </tbody>
    </table>
  );
};

// USAGE

<Table
  rows={[{ name: "Matt" }]}
  // row gets inferred as { name: string }
  renderRow={(row) => {
    //        ^?
    return (
      <tr>
        <td>{row.name}</td>
      </tr>
    );
  }}
/>;
```
