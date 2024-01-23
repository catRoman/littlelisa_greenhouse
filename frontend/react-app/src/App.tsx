import ListGroup from "./components/ListGroup";

function App() {

    const handleSelectItem = (item: string) => {
      console.log(item);
    }

     let items = ["New York", "London", "Paris", "Tokyo"];

  return <div><ListGroup items={items} heading={"Cities"} onSelectItem={handleSelectItem} /></div>

}

export default App;
