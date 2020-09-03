import styled from 'styled-components'

export const Container = styled.div`
  box-sizing: border-box;
  margin: 12px 0;
  padding: 28px;
  maxWidth: 520px;
  border-radius: 10px;
  background-color: #FFF;
  -webkit-box-shadow: 10px 10px 30px -15px rgba(143,143,143,0.5);
  -moz-box-shadow: 10px 10px 30px -15px rgba(143,143,143,0.5);
  box-shadow: 5px 5px 30px -15px rgba(143,143,143,0.5);
  transition-duration: 0.3s;

  &:hover {
    -webkit-box-shadow: 15px 15px 30px -15px rgba(143,143,143,0.5);
    -moz-box-shadow: 15px 15px 30px -15px rgba(143,143,143,0.5);
    box-shadow: 15px 15px 30px -15px rgba(143,143,143,0.5);
    background-color: #EEF;
    cursor: pointer;
  }
`

export const active = styled.div`
  background-color: #eeeeff;
  border: 1px solid #eeeeff;
`

export const Title = styled.div`
  color: #2a2a2a;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 5px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

export const Date = styled.div`
  font-size: 12px;
  color: #777;
`

export const Desc = styled.div`
  width: 300px;
  font-size: 12px;
  color: #777;
  padding-top: 1px;
`
