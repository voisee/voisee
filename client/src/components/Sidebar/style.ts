import styled from 'styled-components'

export const Container = styled.div`
  width: 28vh;
  height: 100vh;
  z-index: 1;
  box-sizing: border-box;
  background-color: #fff;
  -webkit-box-shadow: 8px 0px 25px -20px rgba(143, 143, 143, 1);
  -moz-box-shadow: 8px 0px 25px -20px rgba(143, 143, 143, 1);
  box-shadow: 8px 0px 25px -20px rgba(143, 143, 143, 1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 5vh;
`

export const ProductsList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 24px;
  & > div {
    margin-right: 22px;
  }
  & > div:nth-child(5n) {
    margin-right: 0;
  }
`

export const Navigator = styled.nav`
  font-size: 13px;
  color: #a0a0a0;
`

export const NavTitle = styled.p`
  padding: 0 35px;
`

export const SidebarMenu = styled.ul`
  color: #2a2a2a;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 0;

  & li > a {
    padding: 0 35px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: #2a2a2a;
    text-decoration: none;
    height: 50px;
    font-size: 14px;
    list-style: none;
  }

  & li > a:hover {
    background-color: #f8f8f8;
    color: #4346e1;
  }

  &.active {
    background-color: #f8f8f8 !important;
    color: #4346e1 !important;
  }
`
