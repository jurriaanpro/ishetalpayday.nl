import './App.css';
import * as React from "react";
import qs from "qs";
import {determineDaysToPayDay, determineNextPayDate} from "./helpers";
import {endOfMonth} from "date-fns";

interface State {
    error?: string;
    valueSet: boolean
    value: number
}

interface QueryString {
    dag?: number;
}

class App extends React.Component<any, State> {
    state: State = {
        error: undefined,
        valueSet: false,
        value: 0
    }

    getQueryString(): QueryString {
        return qs.parse(window.location.search, {
            ignoreQueryPrefix: true
        });
    }

    componentDidMount() {
        const query = this.getQueryString();
        const day = query.dag;

        if (day) {
            if (isNaN(day)) {
                this.setState({error: '💥 Geef een dag op tussen 1-31, gekkie!'});
                return;
            }

            if (day > 31) {
                this.setState({error: '💥 Een maand heeft maar maximaal 31 dagen, gekkie!'});
                return;
            }

            if (day <= 0) {
                this.setState({error: '💥 Een negatieve dag is niet mogelijk, gekkie!'})
                return;
            }

            this.setState({value: day, valueSet: true})
        }
    }

    handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({value: parseInt(event.target.value)})
    }

    render() {
        return (
            <div className={"App"}>
                {this.renderContent()}
            </div>
        )
    }

    renderContent() {
        const { valueSet, error } = this.state;

        if (error) {
            return <div>{error}</div>
        }

        if (!valueSet) {
            return <div>{this.renderSetPayDay()}</div>
        }

        return <div>{this.renderCountDown()}</div>
    }

    renderSetPayDay() {
        const maxDayOfCurrentMonth = endOfMonth(new Date()).getDate();

        return (
            <div>
                <p>Vul hieronder de dag in dat je salaris weer wordt gestort</p>
                <input type={"number"} min={"1"} max={maxDayOfCurrentMonth} value={this.state.value} onChange={this.handleOnChange} />
                {this.renderUrl()}
            </div>
        )
    };

    renderUrl() {
        const { value } = this.state;

        if (!value) {
            return;
        }

        const url = `${window.location.href.split('?')[0]}?dag=${value}`;

        return <div><p>en klik dan op de volgende URL <a href={url}>{url}</a></p></div>;
    }

    renderCountDown() {
        const { valueSet, value } = this.state;

        if (!valueSet || !value) {
            return this.renderSetPayDay();
        }

        const nextPayDate = determineNextPayDate(value);
        const daysToPayday = determineDaysToPayDay(nextPayDate);

        if (daysToPayday === 0) {
            return (
                <div className={"payday"}>
                    Het is payday! 🎉💰
                </div>
            )
        }

        if (daysToPayday === 1) {
            return (
                <div>
                    Nog
                    <h1 className={"number"}>{daysToPayday}</h1>
                    dag tot payday!
                </div>
            )
        }

        return (
            <div>
                Nog
                <h1 className={"number"}>{daysToPayday}</h1>
                dagen tot payday!
            </div>
        )
    }
}

export default App;
