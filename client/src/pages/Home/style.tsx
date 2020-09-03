import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-direction: row;
`

export const DashboardContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 100%;
  background-color: rgba(242, 243, 248, 0.5);
  padding: 45px;
`

export const DashboardItem = styled.div`
  display: flex;
  flex-direction: column;
  height: 90vh;

  &:first-child {
    margin-right: 40px;
  }
`

export const Row = styled.div`
  display: flex;

  &>h3 {
    font-size: 24px;
    font-weight: 400;
  }
`
