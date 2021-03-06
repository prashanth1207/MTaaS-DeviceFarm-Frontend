import React, { Component } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';

class SignIn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            invalidCredentials: '',
            persona: "tester",
            email: "",
            password: "",
            invalidEmail: false
        }
        this.changePersona = this.changePersona.bind(this);
        this.authenticateUser = this.authenticateUser.bind(this);
        this.emailChangeHandler = this.emailChangeHandler.bind(this);
        this.passwordChangeHandler = this.passwordChangeHandler.bind(this);
        this.validateCredentials = this.validateCredentials.bind(this);
    }

    changePersona = (event) => {
        this.setState({
            persona: event.target.value
        })
    }

    authenticateUser = (event) => {
        event.preventDefault();
        let url = process.env.REACT_APP_BACKEND_URL + '/signin?persona=' + this.state.persona + '&email=' + this.state.email + '&password=' + this.state.password;
        axios.defaults.withCredentials = true;
        axios.get(url)
            .then(response => {
                if (response.status === 200) {
                    sessionStorage.setItem("persona", this.state.persona);
                    sessionStorage.setItem("email", this.state.email);
                    sessionStorage.setItem("id", response.data._id);
                    sessionStorage.setItem("name", response.data.name);
                    this.setState({
                        invalidCredentials: false
                    })
                } else {
                    this.setState({
                        invalidCredentials: true
                    })
                }
            })
            .catch((error) => {
                this.setState({
                    invalidCredentials: true
                })
            });;
    }

    emailChangeHandler = (event) => {
        if (/.+@.+\.[A-Za-z]+$/.test(event.target.value)) {
            this.setState({
                invalidEmail: false,
                email: event.target.value
            })
        } else {
            this.setState({
                invalidEmail: true,
                email: event.target.value
            })
        }
    }

    passwordChangeHandler = (event) => {
        this.setState({
            password: event.target.value
        })
    }

    validateCredentials = (event) => {
        if (!this.state.invalidEmail && this.state.password !== "") return false
        else return true
    }

    render() {
        let home = null;
        if (sessionStorage.getItem("email") !== null && sessionStorage.getItem("persona") === "tester") {
            home = <Redirect to="/tester/projects" />
        }
        if (sessionStorage.getItem("email") !== null && sessionStorage.getItem("persona") === "manager") {
            home = <Redirect to={"/manager/projects"} />
        }
        if (sessionStorage.getItem("email") !== null && sessionStorage.getItem("persona") === "admin") {
            home = <Redirect to={"/admin/projects"} />
        }
        return (
            <div style={{ marginTop: "40px", overflowX: "hidden" }}>
                {home}
                <div class="container" style={{ width: "450px", backgroundColor: "white", borderRadius: "7px", padding: "30px 40px 30px" }}>
                    <div class="login-form">
                        <div class="panel">
                            <h2 style={{ textAlign: "center" }}>Sign In</h2>
                        </div>
                        <div className="row" style={{ marginLeft: "10px", marginBottom: "10px", marginTop: "30px" }}>
                            <div class="col-md-4 radio-inline">
                                <input type="radio" value="tester" name="persona" onChange={this.changePersona} defaultChecked /><p>I'm a Tester</p>
                            </div>
                            <div class="col-md-4 radio-inline" style={{ margin: "0px", paddingLeft: "5px" }}>
                                <input type="radio" value="manager" name="persona" onChange={this.changePersona} /><p>I'm a Manger</p>
                            </div>
                            <div class="col-md-3 radio-inline" style={{ padding: "0px"}}>
                                <input type="radio" value="admin" name="persona" onChange={this.changePersona} /><p>System Staff</p>
                            </div>
                        </div>
                        <form className="form" onSubmit={this.authenticateUser}>
                            <div class="form-group">
                                <input type="email" onChange={this.emailChangeHandler} style={{ backgroundColor: "" }} class="form-control" name="emailId" placeholder="Email Id" required />
                            </div>
                            <div class="form-group" style={{ "alignItems": "center" }}>
                                {this.state.invalidEmail ? <span style={{ color: "red", "font-weight": "bold", "textAlign": "center" }}>Invalid Email Id. Please check</span> : ''}
                            </div>
                            <div class="form-group">
                                <input type="password" onChange={this.passwordChangeHandler} class="form-control" name="password" placeholder="Password" required />
                            </div>
                            <div class="form-group" style={{ "alignItems": "center" }}>
                                {this.state.invalidCredentials ? <span style={{ color: "red", "font-style": "oblique", "font-weight": "bold", "textAlign": "center" }}>Invalid Username or Password</span> : ''}
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <button disabled={this.validateCredentials()} class="btn btn-success" style={{ "width": "100%" }}>Login</button>
                            </div>
                            <br />
                            <div style={{ textAlign: "center" }}>
                                <Link to="/signup">Not a User? Sign Up</Link>
                            </div>
                        </form>
                        <br />
                    </div>
                </div>
            </div>
        )
    }
}

export default SignIn;