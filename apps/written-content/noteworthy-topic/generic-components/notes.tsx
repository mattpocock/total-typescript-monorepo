const Table = <TRow extends Record<string, any>>(props: {
  rows: TRow[];
  renderRow: React.FC<TRow>;
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
  rows={[{ name: "Matt", id: 1 }]}
  renderRow={(row) => {
    //        ^?
    return (
      <tr>
        <td>{row.name}</td>
      </tr>
    );
  }}
/>;
