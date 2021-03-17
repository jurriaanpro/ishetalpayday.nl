import './App.css';
import * as React from "react";
import qs from "qs";
import {Cookies, withCookies} from "react-cookie";
import {determineDaysToPayDay, determineNextPayDate} from "./helpers";
import {endOfMonth} from "date-fns";


interface Props {
    cookies: Cookies
}

interface State {
    error?: string;
    valueSet: boolean
    cookieSet: boolean
    value?: number
}

interface QueryString {
    dag?: number;
}

class App extends React.Component<Props, State> {
    state: State = {
        error: undefined,
        valueSet: false,
        cookieSet: false,
        value: undefined
    }

    getQueryString(): QueryString {
        return qs.parse(window.location.search, {
            ignoreQueryPrefix: true
        });
    }

    componentDidMount() {
        const { cookies } = this.props;

        const payday = cookies.get("payday")
        const query = this.getQueryString();
        const day = query.dag;

        if (payday) {
            this.setState({cookieSet: true})
        }

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

        if (payday && !day) {
            this.setState({value: payday, valueSet: true});
        }
    }

    handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({value: parseInt(event.target.value)})
    }

    handleOnClickSaveButton = (event: React.MouseEvent<HTMLButtonElement>) => {
        const { cookies } = this.props;
        const { value } = this.state;

        cookies.set("payday", value, { secure: true });
        this.setState({ valueSet: true, cookieSet: true })
    }

    handleOnClickResetButton = (event: React.MouseEvent<HTMLButtonElement>) => {
        const { cookies } = this.props;

        cookies.remove("payday");
        this.setState({ valueSet: false, cookieSet: false })
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

                {this.renderSaveButton()}
                {this.renderUrl()}
            </div>
        )
    };

    renderSaveButton() {
        const { value } = this.state;

        return <button onClick={this.handleOnClickSaveButton} disabled={!value}>Sla op in koekje</button>;
    }

    renderUrl() {
        const { value } = this.state;

        if (!value) {
            return;
        }

        const url = `${window.location.href}?dag=${value}`;

        return <div>of gebruik de volgende URL <a href={url}>{url}</a></div>;
    }

    renderCountDown() {
        const { valueSet, value } = this.state;

        if (!valueSet || !value) {
            return this.renderSetPayDay();
        }

        const nextPayDate = determineNextPayDate(value);
        const daysToPayday = determineDaysToPayDay(nextPayDate);

        return (
            <div>
                Nog
                <h1 className={"number"}>{daysToPayday}</h1>
                dagen tot payday!
                {this.renderResetButton()}
            </div>
        )
    }

    renderResetButton() {
        const { cookieSet } = this.state;

        if (!cookieSet) {
            return;
        }

        return <button onClick={this.handleOnClickResetButton}>Verwijder koekje</button>;
    }
}

const AppWithCookies = withCookies(App);
export default AppWithCookies;
