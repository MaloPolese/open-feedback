import React, { Component } from 'react'
import styled from 'styled-components'
import Box from '../baseComponents/design/Box'
import { connect } from 'react-redux'

const Wrapper = styled(Box)`
    height: 100vh;
    padding: 15px;
    display: flex;
`

class Project extends Component {
    render() {
        const {} = this.props
        return <Wrapper>Project</Wrapper>
    }
}

const mapStateToProps = state => ({})

const mapDispatchToProps = Object.assign({}, {})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Project)