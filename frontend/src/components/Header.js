import { Typography, Box } from "@mui/material";

const Header = ({ title, subtitle }) => {
  return (
    <Box mb="30px">
      <Typography
        variant="h2"
        color={"#4B7DE7"}
        fontWeight="bold"
        sx={{ m: "0 0 5px 0" }}
      >
        {title}
      </Typography>
      <Typography variant="p" color={"#6B7C9B"}>
        {subtitle}
      </Typography>
    </Box>
  );
};

export default Header;
