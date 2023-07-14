import "./App.css";
import axios from "axios";
import logo from "./logo512.png";
import ReactPaginate from "react-paginate";
import { useEffect, useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

import { Row, Col, Button, Modal } from "react-bootstrap";

function App() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);

  const [pageCount, setpageCount] = useState(0);
  const [sizeOfPage, setSizeOfPage] = useState(10);
  const [searchTable, setSearchTable] = useState("");
  const [activePage, setActivePage] = useState(true);
  const [filterEmail, setFilterEmail] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  const columns = [
    { dataField: "_id", text: "Id", sort: true, hidden: true },
    { dataField: "_id", text: "Customer", sort: true },
    { dataField: "name", text: "Name", sort: true },
    { dataField: "email", text: "Email", sort: true },
    { dataField: "location", text: "Location", sort: true },
  ];

  const sizePerPageList = [
    {
      text: "5",
      value: 5,
    },
    {
      text: "10",
      value: 10,
    },
    {
      text: "25",
      value: 25,
    },
  ];

  useEffect(() => {
    let currentPage = 1;
    let pageSize = sizeOfPage;
    fetchData(currentPage, pageSize, searchTable);
  }, [sizeOfPage, searchTable]);

  const handleSubmit = async (filters) => {
    console.log(filters);
    await setFilterEmail(filters.email);
    await setFilterName(filters.name);
    await setFilterLocation(filters.location);
    await setSearchTable("");

    let currentPage = 1;
    let pageSize = sizeOfPage;
    await fetchData(
      currentPage,
      pageSize,
      "",
      filters.email,
      filters.name,
      filters.location
    );
  };

  const toggle = () => {
    setModal(!modal);
  };
  const openModalWithHeaderClass = () => {
    toggle();
  };

  const fetchData = async (currentPage, pageSize, searchTable, cf, nf, lf) => {
    let values = {
      page: currentPage,
      size: pageSize,
      search: searchTable ? searchTable : "",
      filterEmail: cf ? cf : "",
      filterName: nf ? nf : "",
      filterLocation: lf ? lf : "",
    };
    console.log(values);
    let serverData = await axios
      .post("http://localhost:9000/paginator/user/alluser", values)
      .then((response) => {
        console.log(response.data);
        let fileResponse = response.data;
        setpageCount(Math.ceil(response.data.totalData / pageSize));
        if (fileResponse.isSucess === true) {
          return fileResponse.response;
        } else {
          return fileResponse.response;
        }
      });
    let refinedData = [{ _id: "No data found" }];
    if (serverData === "Unable to fetch user") {
      serverData = refinedData;
    }

    setItems(serverData);
    return serverData;
  };

  const handlePageClick = async (data) => {
    // console.log(data.selected);

    let currentPage = data.selected + 1;
    let pageSize = sizeOfPage;
    let search = searchTable;

    const dataFromServer = await fetchData(
      currentPage,
      pageSize,
      search,
      filterEmail,
      filterName,
      filterLocation
    );
    setActivePage(true);

    setItems(dataFromServer);
    // scroll to the top
    //window.scrollTo(0, 0)
  };
  return (
    <div className="">
      <div className=" mt-2">
        <div className="mb-1 d-flex justify-content-between">
          <div className="d-flex">
            <input
              className="form-control w-auto ms-1"
              value={searchTable}
              type="text"
              placeholder="Search..."
              onChange={(e) => setSearchTable(e.target.value)}
            ></input>
            <button
              className="btn btn-primary"
              onClick={async () =>
                await fetchData(
                  1,
                  sizeOfPage,
                  searchTable,
                  filterEmail,
                  filterName
                )
              }
            >
              Submit
            </button>
          </div>

          <div className="" style={{ float: "right", marginRight: "10px" }}>
            <Button
              className="float-right mb-2 "
              variant="btn btn-primary float-end d-inline"
              onClick={() => openModalWithHeaderClass()}
            >
              <img
                style={{ height: "10px", width: "10px" }}
                src={logo}
                alt="icon"
              ></img>
            </Button>
          </div>
        </div>
        <div style={{ overflow: "auto" }}>
          <BootstrapTable
            bootstrap4
            keyField="id"
            data={items ? items : []}
            columns={columns}
            className="pr-3"
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between " }}>
          <div className="d-inline-block me-3">
            <label className="me-1">Display :</label>
            <select
              value={sizeOfPage}
              onChange={(e) => {
                setActivePage(false);
                setSizeOfPage(e.target.value);
              }}
              className="form-select d-inline-block w-auto"
            >
              {(sizePerPageList || []).map((pageSize, index) => {
                return (
                  <option key={index} value={pageSize.value}>
                    {pageSize.text}
                  </option>
                );
              })}
            </select>
          </div>

          <ReactPaginate
            className="pagination pagination-rounded d-inline-flex ms-auto align-item-center mb-0"
            previousLabel={"<"}
            nextLabel={">"}
            breakLabel={".."}
            pageCount={pageCount}
            marginPagesDisplayed={1}
            pageRangeDisplayed={3}
            onPageChange={handlePageClick}
            containerClassName={"pagination justify-content-center"}
            pageClassName={"page-item"}
            pageLinkClassName={"page-link"}
            previousClassName={"page-item"}
            previousLinkClassName={"page-link"}
            nextClassName={"page-item"}
            nextLinkClassName={"page-link"}
            breakClassName={"page-item"}
            breakLinkClassName={"page-link"}
            activeClassName={activePage ? "active" : ""}
          />
        </div>
      </div>

      <Modal show={modal} onHide={toggle}>
        <Modal.Header
          onHide={toggle}
          closeButton
          className="modal-colored-header bg-primary"
        >
          <h4 className="modal-title text-light">Filters</h4>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{
              email: filterEmail,
              name: filterName,
              location: filterLocation,
            }}
            validationSchema={Yup.object().shape({
              // customer: Yup.string().required("Customer is required"),
              // name: Yup.string().required("Name is required"),
            })}
            onSubmit={(fields) => {
              handleSubmit(fields);
              toggle();
            }}
            render={({ errors, status, touched }) => (
              <Form>
                <div className="filter">
                  <label>Email</label>
                  <Field
                    name="email"
                    type="text"
                    placeholder="Email"
                    className={
                      "form-control" +
                      (errors.customer && touched.customer ? " is-invalid" : "")
                    }
                  />
                </div>

                <div className="aams-login-loginPassBox">
                  <label>Name</label>

                  <Field
                    name="name"
                    type="text"
                    placeholder="Name"
                    className={
                      "form-control" +
                      (errors.name && touched.name ? " is-invalid" : "")
                    }
                  />
                </div>

                <div className="aams-login-loginPassBox">
                  <label>Location</label>

                  <Field
                    name="location"
                    type="text"
                    placeholder="Location"
                    className={
                      "form-control" +
                      (errors.location && touched.location ? " is-invalid" : "")
                    }
                  />
                </div>

                <Row>
                  <Col>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        type="submit"
                        className="btn btn-primary mt-2"
                        // disabled={loginbutton}
                      >
                        Submit
                      </button>
                    </div>
                  </Col>
                </Row>
              </Form>
            )}
          />
        </Modal.Body>
        {/* <Modal.Footer>
          
        </Modal.Footer> */}
      </Modal>
    </div>
  );
}

export default App;
