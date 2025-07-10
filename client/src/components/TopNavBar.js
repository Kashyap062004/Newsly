import React, { useRef, useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import YouTubeIcon from "@mui/icons-material/YouTube";
import Button from "@mui/material/Button";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { gsap } from "gsap";
import { Link, useNavigate, useLocation } from "react-router-dom";

const categories = [
  "Home", "Recommended", "India", "World", "Business", "Tech", "Cricket",
  "Sports", "Entertainment", "Astro", "TV", "Education", "Life & Style", "Web Series"
];

function TopNavBar({ category, setCategory, search, setSearch, onSearch }) {
  const navRef = useRef();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    gsap.from(navRef.current, { y: -80, opacity: 1, duration: 1, ease: "power3.out" });
  }, []);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleUserMenuOpen = (event) => setUserMenuAnchor(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);

  const handleCategoryClick = (cat) => {
    if (setCategory) setCategory(cat);
    if (location.pathname !== "/feed") {
      navigate("/feed");
    }
    handleMenuClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch && typeof onSearch === "function") {
      onSearch(search);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }} ref={navRef}>
      <AppBar
        position="relative"
        elevation={8}
        sx={{
          bgcolor: "#1976d2",
          color: "#fff",
          borderBottom: "3px solid #1565c0",
          boxShadow: "0 8px 32px rgba(25, 118, 210, 0.18)",
          marginBottom: 2,
          marginTop: 10,
          transition: "background-color 0.3s, box-shadow 0.3s",
        }}
      >
        <Toolbar sx={{ flexWrap: "wrap", justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            noWrap
            sx={{
              mr: 3,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: 1,
              fontSize: { xs: "1.1rem", sm: "1.3rem" }
            }}
          >
            📰 Newsly
          </Typography>

          {/* Desktop categories */}
          <Box sx={{ display: { xs: "none", md: "flex" }, flexGrow: 1, overflowX: "auto" }}>
            {categories.map((cat) => (
              <MenuItem
                key={cat}
                selected={category === cat}
                onClick={() => handleCategoryClick(cat)}
                sx={{
                  color: category === cat ? "#fff" : "#e3e3e3",
                  background: category === cat ? "#1565c0" : "transparent",
                  borderRadius: 2,
                  fontWeight: category === cat ? 700 : 500,
                  minWidth: 80,
                  fontSize: { xs: "0.95rem", sm: "1.05rem" },
                  transition: "all 0.2s",
                  mx: 0.5,
                  "&:hover": {
                    background: "#115293",
                    color: "#fff"
                  }
                }}
              >
                {cat}
              </MenuItem>
            ))}
          </Box>

          {/* Mobile hamburger menu */}
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center" }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuOpen}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{ sx: { bgcolor: "#1976d2", color: "#fff" } }}
            >
              {categories.map((cat) => (
                <MenuItem
                  key={cat}
                  selected={category === cat}
                  onClick={() => handleCategoryClick(cat)}
                  sx={{
                    color: category === cat ? "#fff" : "#e3e3e3",
                    background: category === cat ? "#1565c0" : "transparent",
                    borderRadius: 2,
                    fontWeight: category === cat ? 700 : 500,
                    minWidth: 100,
                    fontSize: "1rem",
                    "&:hover": {
                      background: "#115293",
                      color: "#fff"
                    }
                  }}
                >
                  {cat}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Search + Icons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center" }}>
              <InputBase
                placeholder="Search news…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{
                  ml: 1,
                  flex: 1,
                  background: "#fff",
                  borderRadius: 1,
                  px: 1,
                  fontSize: 16,
                  width: { xs: 80, sm: 140, md: 180 },
                  color: "#222"
                }}
                inputProps={{ "aria-label": "search" }}
              />
              <IconButton type="submit" sx={{ p: "6px", color: "#fff" }} aria-label="search">
                <SearchIcon />
              </IconButton>
            </form>

            <IconButton href="https://facebook.com" target="_blank" sx={{ color: "#fff" }}>
              <FacebookIcon />
            </IconButton>
            <IconButton href="https://twitter.com" target="_blank" sx={{ color: "#fff" }}>
              <TwitterIcon />
            </IconButton>
            <IconButton href="https://youtube.com" target="_blank" sx={{ color: "#fff" }}>
              <YouTubeIcon />
            </IconButton>

            <Button color="inherit" onClick={async () => {
              await fetch("http://localhost:8000/user/logout", {
                method: "POST",
                credentials: "include"
              });
              window.location.reload();
            }}>
              Logout
            </Button>

            {/* User menu */}
            <IconButton color="inherit" onClick={handleUserMenuOpen} sx={{ ml: 1 }}>
              <AccountCircleIcon />
            </IconButton>
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              PaperProps={{ sx: { bgcolor: "#1976d2", color: "#fff" } }}
            >
              <MenuItem component={Link} to="/liked" onClick={handleUserMenuClose}>
                ❤️ Liked Articles
              </MenuItem>
              <MenuItem component={Link} to="/bookmarks" onClick={handleUserMenuClose}>
                ⭐ Bookmarked Articles
              </MenuItem>
              <MenuItem component={Link} to="/profile" onClick={handleUserMenuClose}>
                👤 Profile
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default TopNavBar;
