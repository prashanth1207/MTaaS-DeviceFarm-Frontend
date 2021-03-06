import React, { Component } from 'react';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label, BarChart, Bar, Cell,
  } from 'recharts';
import moment from 'moment';


const monthMapping = {
    '01': 'January', 
    '02': 'February', 
    '03': 'March', 
    '04': 'April', 
    '05': 'May',
    '06': 'June', 
    '07': 'July', 
    '08': 'August', 
    '09': 'September', 
    '10': 'October',
    '11': 'November', 
    '12': 'December'
}

const minCost = 0.5;

export default class Cost extends Component {
    constructor(props) {
        super(props);
        this.state = {
            projectAllocationDetails: [],
            selectedBillingPeriod: 'all',
            billingPeriods: [],
            deviceMindetails: [],
            data: null
        }

        this.getProjectAllocationInfo = this.getProjectAllocationInfo.bind(this);
        this.generateData = this.generateData.bind(this);
        this.fetchEmulatorSessions = this.fetchEmulatorSessions.bind(this);
        this.fetchRuns = this.fetchRuns.bind(this);
    }

    componentDidMount() {
        this.getProjectAllocationInfo();
    }
    fetchEmulatorSessions = async () => {
        return await new Promise((resolve, reject) => {
            const { project } = this.props;
            let url = process.env.REACT_APP_BACKEND_URL + '/remoteAccessSession';
            let params = {
                tester: sessionStorage.getItem('id'),
                project: project._id
            }
            axios.defaults.withCredentials = true;
            axios.get(url, {params: params})
            .then(response => {
                    if (response.status === 200 && response.data) {
                        resolve(response.data.remoteSessions);
                    }else{
                        reject(response.data.error);
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        })
    }

    fetchRuns = async () => {
        return await new Promise((resolve, reject) => {
            const { project } = this.props;
            let url = process.env.REACT_APP_BACKEND_URL + '/project/' + project._id + '/tests?testerId='+sessionStorage.getItem('id');
            axios.defaults.withCredentials = true;
            axios.get(url)
                .then(response => {
                    if (response.status === 200) {
                        resolve(response.data);
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        })
    }


    getProjectAllocationInfo = async () => {
        let remoteSessions = await this.fetchEmulatorSessions().catch(e => {
            console.error(e)
            return [];
        });
        let runs = await this.fetchRuns().catch(e => {
            console.error(e)
            return [];
        });
        this.generateData(runs, remoteSessions);
    }

    generateData = (runs, remoteSessions) => {
        let data = [
            {name:'January', RealDeviceMinutes: 0, EmulatorDeviceMinutes: 0, MonthlyCost:0},
            {name:'February', RealDeviceMinutes: 0, EmulatorDeviceMinutes: 0, MonthlyCost:0},
            {name:'March', RealDeviceMinutes: 0, EmulatorDeviceMinutes: 0, MonthlyCost:0},
            {name:'April', RealDeviceMinutes: 0, EmulatorDeviceMinutes: 0, MonthlyCost:0},
            {name:'May', RealDeviceMinutes: 0, EmulatorDeviceMinutes: 0, MonthlyCost:0},
            {name:'June', RealDeviceMinutes: 0, EmulatorDeviceMinutes: 0, MonthlyCost:0},
            {name:'July', RealDeviceMinutes: 0, EmulatorDeviceMinutes: 0, MonthlyCost:0},
            {name:'August', RealDeviceMinutes: 0, EmulatorDeviceMinutes: 0, MonthlyCost:0},
            {name:'September', RealDeviceMinutes: 0, EmulatorDeviceMinutes: 0, MonthlyCost:0},
            {name:'October', RealDeviceMinutes: 0, EmulatorDeviceMinutes: 0, MonthlyCost:0},
            {name:'November', RealDeviceMinutes: 0, EmulatorDeviceMinutes: 0, MonthlyCost:0},
            {name:'December', RealDeviceMinutes: 0, EmulatorDeviceMinutes: 0, MonthlyCost:0}
        ];
        let months = {};
        remoteSessions.forEach(session => {
            let deviceMinutes = parseFloat((session.sessionDetails.deviceMinutes || {total: 0}).total)
            if(deviceMinutes > 0){
                let monthName = moment(session.sessionDetails.created).format("MMMM");
                let monthNum = moment(session.sessionDetails.created).format("MM");
                let dataMonth = data.find(record => record.name === monthName);
                dataMonth.EmulatorDeviceMinutes +=  Math.round(deviceMinutes * 100)/100;
                months[monthNum] = monthName;
            }
        });
        runs.forEach(run => {
            let deviceMinutes = parseFloat((run.deviceMinutes || {total: 0}).total)
            if(deviceMinutes > 0){
                let monthName = moment(run.triggeredAt).format("MMMM");
                let monthNum = moment(run.triggeredAt).format("MM");
                let dataMonth = data.find(record => record.name === monthName);
                dataMonth.RealDeviceMinutes +=  Math.round(deviceMinutes * 100)/100;
                months[monthNum] = monthName;
            }
        });

        data.forEach(month => {
            month.MonthlyCost = month.RealDeviceMinutes * minCost + month.EmulatorDeviceMinutes * minCost;
            month.MonthlyCost = Math.round(month.MonthlyCost * 100)/100;
            month.EmulatorDeviceMinutes = Math.round(month.EmulatorDeviceMinutes * 100)/100;
            month.RealDeviceMinutes = Math.round(month.RealDeviceMinutes * 100)/100;
        })
        this.setState({
            deviceMindetails: data,
            data: data,
            billingPeriods: Object.keys(months).sort().map(month => months[month])
        })

    }

    onChangeBillingPeriod = (e) => {
        if(e.target.value === 'all'){
            this.setState({
                selectedBillingPeriod: 'all',
                data: this.state.deviceMindetails
            })
        }
        else{
            this.setState({
                selectedBillingPeriod: e.target.value
            })

            this.state.deviceMindetails.forEach(detail => {
                if(detail.name === e.target.value){
                    console.log(detail);
                    this.setState({
                        data: [detail]
                    })
                }
            });
        }
    }

    render() {
        let graph_billing_period = 
        <BarChart width={500} height={450} data={this.state.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" label={{ value: "Billing Period", position: "insideBottomRight", dy: 7}} />
            <YAxis label={{ value: "Amount", position: "insideLeft", angle: -90,   dy: -10}} />
            <Tooltip />
            <Bar name="Total Real Device Minutes Run" dataKey="RealDeviceMinutes" fill="#8884d8" />
            <Bar name="Total Emulator Device Minutes" dataKey="EmulatorDeviceMinutes" fill="red" />
            <Bar name="Estimated Earnings" dataKey="MonthlyCost" fill="#82ca9d" />
        </BarChart>
        return(
            <div style={{ marginTop: "40px", overflowX: "hidden", overflowY: "hidden" }}>
                <div className="container" style={{ width: "920px", backgroundColor: "white",borderRadius: "7px",padding:"30px 40px 60px" }}>
                    <div style={{ padding:"0px 0px 70px 0px" }}>
                        <div className="dropdown" style={{ float: "left" }}>
                            <select ref="userInput"
                                required
                                style={{ width: "400px" }}
                                className="form-control"
                                value={this.state.selectedBillingPeriod}
                                onChange={this.onChangeBillingPeriod}>
                                <option key='all' value='all'>Billing Period for this year</option>
                                {
                                    this.state.billingPeriods.map((billingPeriod) => {
                                        return <option key={billingPeriod} value={billingPeriod}>{billingPeriod}</option>
                                    })
                                }
                            </select>
                        </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <p>Usage Metrics</p>
                        <div style={{ padding:"0px 0px 0px 140px" }}>
                            {graph_billing_period}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}