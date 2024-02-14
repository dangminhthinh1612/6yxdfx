import { useEffect, useState } from "react";
import * as cheerio from "cheerio";
import { Button, Form, Row, Table, Col } from "react-bootstrap";
import "./styles.css";

interface Item {
  iId: string;
  num: number;
  url: string;
}

export default function App() {
  const [count, setCount] = useState(0);
  const [viewNumber, setViewNumber] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [list, setList] = useState<Item[]>([
    { iId: Date.now().toString(), num: 0, url: "" },
  ]);

  const isDone = (num: number) => {
    return num !== 0 && count >= num;
  };

  const addField = () => {
    setList([...list, { iId: Date.now().toString(), num: 0, url: "" }]);
  };

  const addTwentyField = async () => {
    const listHrefs: Item[] = [];
    setLoading(true);

    await fetch(
      "https://kinhte.congthuong.vn/search_enginer.html?BRSR=2&p=tim-kiem&q=thanh+th%C3%BAy"
    )
      .then((response) => response.text())
      .then((html) => {
        const $ = cheerio.load(html);

        $("a.article-link").each((index, element) => {
          const href = $(element).attr("href");
          listHrefs.push({
            iId: `${Date.now()}${index}`,
            num: viewNumber,
            url: `https://kinhte.congthuong.vn/${href}`,
          });
        });
      })
      .catch((error) => {
        console.error(error);
      });

    setList([...list, ...listHrefs]);
    setLoading(false);
  };

  const removeField = (id: string) => {
    setList(list.filter((e) => e.iId !== id));
  };

  const handleFieldChange = (id: string, event: any, field: string) => {
    const item = list.find((e) => e.iId === id) as Item;
    const val = event.target.value;

    if (field === "url") {
      item.url = val;
    } else {
      item.num = val;
    }
  };

  const handleSubmit = () => {
    for (const e of list) {
      if (e.num > count) window.open(e.url);
    }
    setCount(count + 1);
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "Enter") {
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  });

  return true ? (
    <div></div>
  ) : (
    <div className="container mb-5">
      <Table bordered size="small">
        <tbody>
          <tr>
            <td>Close tabs to the right</td>
            <td>
              <Button
                onClick={!isLoading ? addTwentyField : undefined}
                variant="warning"
                disabled={isLoading}
              >
                {isLoading ? "Loading ..." : "Add 20 articles"}
              </Button>
            </td>
            <td>
              <Button onClick={addField} variant="info">
                Add one more
              </Button>
            </td>
            <td>
              <Button onClick={handleSubmit} variant="success" className="ms-5">
                Click
              </Button>
            </td>
          </tr>
          <tr>
            <td>
              <pre>Alt+Shift+R</pre>
            </td>
            <td className="d-flex align-items-baseline">
              <pre>Default view:</pre>
              <input
                type="text"
                style={{ width: "50px" }}
                defaultValue={viewNumber}
                onChange={(event) => setViewNumber(Number(event.target.value))}
              />
            </td>
            <td>
              <pre>No shortcut</pre>
            </td>
            <td>
              <pre>Ctrl + Enter</pre>
            </td>
          </tr>
        </tbody>
      </Table>
      <section>
        <h4 className="mt-3">Click count: {count}</h4>
      </section>
      <Form className="d-flex flex-column">
        {list.map((element) => (
          <Row className="d-flex mt-1" key={element.iId}>
            <Col>
              <Form.Control
                placeholder="URL"
                defaultValue={element.url}
                onChange={(event) =>
                  handleFieldChange(element.iId, event, "url")
                }
                className={`${isDone(element.num) ? "done" : ""}`}
              />
            </Col>
            <Col xs={1}>
              <Form.Control
                autoFocus
                defaultValue={element.num}
                onChange={(event) =>
                  handleFieldChange(element.iId, event, "num")
                }
              />
            </Col>
            <Col xs={1}>
              <Button variant="danger" onClick={() => removeField(element.iId)}>
                x
              </Button>
            </Col>
          </Row>
        ))}
      </Form>
    </div>
  );
}
