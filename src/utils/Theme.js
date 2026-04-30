import { ConfigProvider } from 'antd';
export const lightTheme = {
    body: '#f4f4f4',
    text: '#333',
    toggleBorder: '#FFF',
    gradient: 'linear-gradient(#39598A, #79D7ED)',
};

export const darkTheme = {
    body: '#282c36',
    text: '#fff',
    toggleBorder: '#6B8096',
    gradient: 'linear-gradient(#091236, #1E215D)',
};

const theme = {
    token: {
        colorPrimary: '#1A48D3',
        colorSuccess: '#359766',
        colorWarning: '#FFAD4F',
        colorError: '#D1293D',
        fontFamily: 'Inter, sans-serif',
        colorPrimaryHover: '#163CB0',
    },
    components: {
        Button: {
            defaultBorderColor: '#1A48D3',
            defaultColor: '#1A48D3',
            defaultBg: 'rgba(0,0,0,0.0)',
            fontSize: '12px',
            controlHeight: '28px',
        },
        Input: {
            hoverBorderColor: '#1A48D3',
        },
        Table: {
            rowHoverBg: '#F8F9FA',
            headerBg: '#F8F9FA',
            cellPaddingBlock: '8px',
            headerColor: '#5e6782',
            fontSize: '11px',
            paddingInline: '12px',
        },
        Pagination: {
            fontSize: '12px',
            itemBg: '#fff',
            colorBorder: '#e4e6e9',
            lineWidth: '1px',
            lineType: 'solid',
            lineHeight: '1.66667',
        },
        Select: {
            optionSelectedBg: '#f3f5fe',
            optionSelectedColor: '#1a48d3',
            optionActiveBg: '#f3f5fe',
            fontSize: '12px',
            optionPadding: '7px 5px 5px 5px',
            controlItemBgHover: '#1A48D3',
        },
        Layout: {
            headerBg: '#F3F5FE',
            bodyBg: '#ffffff',
            siderBg: '#F8F9FA',
        },
        Menu: {
            itemActiveBg: '#1A48D3',
            darkItemColor: '#5E6782',
        },
        Tabs: {
            itemActiveColor: '#f8f9fa',
        },
        Card: {
            fontSize: '11px',
        },
        Tooltip: {
            fontSize: '11px',
        },
        DatePicker: {
            fontSize: '12px',
            cellHeight: '18px',
            cellHoverBg: '#f3f5fe',
            controlHeight: '28px',
        },
        Dropdown: {
            controlPaddingHorizontal: 8,
            controlHeight: 28,
        },
    },
    hashed: false,
};
export { theme, ConfigProvider };
