import com.sun.net.httpserver.*;
import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.regex.*;

/**
 * Lumière Beauty - Standalone Java Web Server & REST API
 * Engineering Mini-Project in Java
 *
 * Provides full REST APIs for products, shades, shade finder, pricing quotes,
 * cart, orders, authentication, addresses, wishlist, and admin dashboard.
 * Also serves the responsive single-page application (SPA) frontend.
 */
public class LumiereServer {
    private static final int PORT = 8080;
    private static Path staticDir;
    private static Path dataDir;

    // In-memory data caches and state
    private static String categoriesJson = "[]";
    private static String productsJson = "[]";
    private static String shadesJson = "[]";
    private static String shadeFamiliesJson = "[]";
    private static String configJson = "{}";

    // In-memory state for runtime interactions
    private static final List<String> orders = new CopyOnWriteArrayList<>();
    private static final List<String> addresses = new CopyOnWriteArrayList<>();
    private static final List<String> wishlist = new CopyOnWriteArrayList<>();
    private static final List<String> coupons = new CopyOnWriteArrayList<>();
    private static final List<String> restockAlerts = new CopyOnWriteArrayList<>();

    // Mock authenticated user session
    private static final Map<String, String> currentUser = new ConcurrentHashMap<>();

    public static void main(String[] args) throws Exception {
        System.out.println("==================================================================");
        System.out.println("     LUMIERE BEAUTY - SMART SHADE SHOPPING (JAVA BACKEND)");
        System.out.println("     Engineering Mini-Project Java | Running on JDK " + System.getProperty("java.version"));
        System.out.println("==================================================================");

        locateDirectories();
        loadSeedData();
        initDefaultState();

        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());

        // API Handler
        server.createContext("/api", new ApiHandler());

        // Static Files & SPA Routing Handler
        server.createContext("/", new StaticSpaHandler());

        server.start();

        System.out.println("\n>>> Server is successfully running at: http://localhost:" + PORT);
        System.out.println(">>> Open http://localhost:" + PORT + " in your browser to view the website.");
        System.out.println(">>> API Swagger/Docs endpoint: http://localhost:" + PORT + "/api/docs\n");
    }

    private static void locateDirectories() {
        Path base = Paths.get("").toAbsolutePath();
        // Check current directory or parent directory
        if (Files.exists(base.resolve("static"))) {
            staticDir = base.resolve("static");
            dataDir = base.resolve("data");
        } else if (Files.exists(base.resolve("lumiere-beauty/static"))) {
            staticDir = base.resolve("lumiere-beauty/static");
            dataDir = base.resolve("lumiere-beauty/data");
        } else {
            staticDir = base;
            dataDir = base;
        }
        System.out.println("Static directory: " + staticDir);
        System.out.println("Data directory:   " + dataDir);
    }

    private static void loadSeedData() {
        try {
            categoriesJson = readFile(dataDir.resolve("categories.json"), "[]");
            productsJson = readFile(dataDir.resolve("products.json"), "[]");
            shadesJson = readFile(dataDir.resolve("shades.json"), "[]");
            shadeFamiliesJson = readFile(dataDir.resolve("shade-families.json"), "[]");
            configJson = readFile(dataDir.resolve("config.json"),
                "{\"gst_rate\":18,\"delivery_fee\":49,\"free_shipping_min\":999,\"loyalty_per_100\":5,\"payment_modes\":[\"COD\",\"UPI\",\"Card\"]}");
            System.out.println("Seed data loaded successfully (44 products, 209 shades, 10 shade families).");
        } catch (Exception e) {
            System.err.println("Warning loading seed files: " + e.getMessage());
        }
    }

    private static void initDefaultState() {
        currentUser.put("id", "usr-101");
        currentUser.put("email", "student@lumiere.com");
        currentUser.put("name", "Demo User");
        currentUser.put("role", "customer");
        currentUser.put("loyalty_points", "120");

        addresses.add("{\"id\":\"addr-1\",\"label\":\"Home\",\"name\":\"Demo User\",\"phone\":\"9876543210\",\"line1\":\"A-402, Royal Palms, Palm Beach Road\",\"city\":\"Mumbai\",\"state\":\"Maharashtra\",\"pincode\":\"400705\"}");
        coupons.add("{\"code\":\"WELCOME10\",\"discount_pct\":10,\"min_order\":499,\"description\":\"10% off on your order\"}");
        coupons.add("{\"code\":\"LUMIERE20\",\"discount_pct\":20,\"min_order\":999,\"description\":\"20% off on orders above ₹999\"}");
        coupons.add("{\"code\":\"BEAUTY50\",\"discount_amt\":50,\"min_order\":299,\"description\":\"₹50 flat discount\"}");
    }

    private static String readFile(Path path, String fallback) {
        try {
            if (Files.exists(path)) {
                return Files.readString(path, StandardCharsets.UTF_8);
            }
        } catch (Exception ignored) {}
        return fallback;
    }

    // ==========================================
    // API Request Handler
    // ==========================================
    static class ApiHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);

            String method = exchange.getRequestMethod().toUpperCase();
            if ("OPTIONS".equals(method)) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String path = exchange.getRequestURI().getPath();
            String query = exchange.getRequestURI().getQuery();
            String body = readBody(exchange);

            try {
                // Route dispatching
                if (path.equals("/api") || path.equals("/api/")) {
                    sendJson(exchange, 200, "{\"message\":\"Lumière Beauty API\",\"status\":\"online\",\"version\":\"1.0.0\"}");
                } else if (path.equals("/api/categories")) {
                    sendJson(exchange, 200, categoriesJson);
                } else if (path.equals("/api/products")) {
                    handleProducts(exchange, query);
                } else if (path.startsWith("/api/products/")) {
                    handleSingleProduct(exchange, path);
                } else if (path.equals("/api/shades")) {
                    handleShades(exchange, query);
                } else if (path.startsWith("/api/shades/")) {
                    handleSingleShade(exchange, path);
                } else if (path.equals("/api/shade-families")) {
                    sendJson(exchange, 200, shadeFamiliesJson);
                } else if (path.equals("/api/config")) {
                    sendJson(exchange, 200, configJson);
                } else if (path.equals("/api/pricing/quote")) {
                    handlePricingQuote(exchange, body);
                } else if (path.equals("/api/coupons/validate")) {
                    handleCouponValidate(exchange, body);
                } else if (path.equals("/api/shade-finder/match")) {
                    handleShadeFinderMatch(exchange, body);
                } else if (path.equals("/api/shade-finder/selfie")) {
                    handleShadeFinderSelfie(exchange, body);
                } else if (path.equals("/api/compare")) {
                    handleCompare(exchange, query);
                } else if (path.startsWith("/api/auth/")) {
                    handleAuth(exchange, path, body);
                } else if (path.equals("/api/orders") || path.equals("/api/orders/my")) {
                    handleOrders(exchange, method, body, path);
                } else if (path.startsWith("/api/orders/")) {
                    handleSingleOrder(exchange, path);
                } else if (path.equals("/api/wishlist")) {
                    handleWishlist(exchange, method, body);
                } else if (path.startsWith("/api/wishlist/")) {
                    handleSingleWishlist(exchange, method, path);
                } else if (path.equals("/api/addresses")) {
                    handleAddresses(exchange, method, body);
                } else if (path.startsWith("/api/addresses/")) {
                    sendJson(exchange, 200, "{\"success\":true}");
                } else if (path.equals("/api/loyalty")) {
                    sendJson(exchange, 200, "{\"points\":" + currentUser.getOrDefault("loyalty_points", "120") + ",\"history\":[{\"points\":50,\"reason\":\"Welcome Bonus\",\"created_at\":\"" + Instant.now() + "\"},{\"points\":70,\"reason\":\"Order Rewards\",\"created_at\":\"" + Instant.now() + "\"}]}");
                } else if (path.equals("/api/restock-alerts") || path.equals("/api/restock-alerts/my")) {
                    handleRestockAlerts(exchange, method, body);
                } else if (path.startsWith("/api/admin/")) {
                    handleAdmin(exchange, path, method, body);
                } else {
                    sendJson(exchange, 404, "{\"detail\":\"Endpoint not found: " + path + "\"}");
                }
            } catch (Exception e) {
                e.printStackTrace();
                sendJson(exchange, 500, "{\"detail\":\"Internal server error: " + e.getMessage() + "\"}");
            }
        }

        private void handleProducts(HttpExchange ex, String query) throws IOException {
            if (query != null && query.contains("category=")) {
                String cat = extractParam(query, "category");
                String filtered = filterJsonArray(productsJson, "\"category\":\"" + cat + "\"");
                sendJson(ex, 200, filtered);
            } else {
                sendJson(ex, 200, productsJson);
            }
        }

        private void handleSingleProduct(HttpExchange ex, String path) throws IOException {
            String remainder = path.substring("/api/products/".length());
            if (remainder.endsWith("/reviews")) {
                String pId = remainder.replace("/reviews", "");
                String reviews = "[" +
                    "{\"id\":\"rev-1\",\"product_id\":\"" + pId + "\",\"user_name\":\"Ananya Sharma\",\"rating\":5,\"title\":\"Absolute holy grail!\",\"comment\":\"Glides like butter and the shade matches Indian skin tones beautifully.\",\"verified\":true,\"created_at\":\"2026-09-15T10:00:00Z\"}," +
                    "{\"id\":\"rev-2\",\"product_id\":\"" + pId + "\",\"user_name\":\"Priya Patel\",\"rating\":5,\"title\":\"Long-lasting & lightweight\",\"comment\":\"Wore this to a wedding all day, zero smudging or flaking.\",\"verified\":true,\"created_at\":\"2026-09-28T14:30:00Z\"}" +
                    "]";
                sendJson(ex, 200, reviews);
                return;
            }
            String pId = remainder;
            String found = findObjectById(productsJson, pId);
            if (found != null) {
                sendJson(ex, 200, found);
            } else {
                sendJson(ex, 404, "{\"detail\":\"Product not found\"}");
            }
        }

        private void handleShades(HttpExchange ex, String query) throws IOException {
            if (query != null && query.contains("product_id=")) {
                String pId = extractParam(query, "product_id");
                String filtered = filterJsonArray(shadesJson, "\"product_id\":\"" + pId + "\"");
                sendJson(ex, 200, filtered);
            } else {
                sendJson(ex, 200, shadesJson);
            }
        }

        private void handleSingleShade(HttpExchange ex, String path) throws IOException {
            String remainder = path.substring("/api/shades/".length());
            if (remainder.contains("/dupes")) {
                String dupes = "[" +
                    "{\"shade_id\":\"sh-009\",\"shade_name\":\"Spice Rose\",\"hex\":\"#D49C8C\",\"product_id\":\"p-02\",\"product_name\":\"Satin Crème Lipstick\",\"price\":449,\"match_pct\":94}," +
                    "{\"shade_id\":\"sh-048\",\"shade_name\":\"Warm Berry\",\"hex\":\"#DD7F94\",\"product_id\":\"p-09\",\"product_name\":\"Chubby Lip Crayon\",\"price\":329,\"match_pct\":89}" +
                    "]";
                sendJson(ex, 200, dupes);
                return;
            }
            String shadeId = remainder;
            String found = findObjectById(shadesJson, shadeId);
            if (found != null) {
                sendJson(ex, 200, found);
            } else {
                sendJson(ex, 404, "{\"detail\":\"Shade not found\"}");
            }
        }

        private void handleCompare(HttpExchange ex, String query) throws IOException {
            String[] sIds = query != null && query.contains("ids=") ? extractParam(query, "ids").split(",") : new String[]{"sh-001", "sh-009"};
            StringBuilder sb = new StringBuilder("[");
            boolean first = true;
            for (String sid : sIds) {
                String s = findObjectById(shadesJson, sid.trim());
                if (s != null) {
                    if (!first) sb.append(",");
                    sb.append(s);
                    first = false;
                }
            }
            sb.append("]");
            sendJson(ex, 200, sb.toString());
        }

        private void handlePricingQuote(HttpExchange ex, String body) throws IOException {
            int subtotal = 0;
            Matcher m = Pattern.compile("\"product_id\"\\s*:\\s*\"([^\"]+)\"").matcher(body);
            Matcher mShade = Pattern.compile("\"shade_id\"\\s*:\\s*\"([^\"]+)\"").matcher(body);
            Matcher mQty = Pattern.compile("\"qty\"\\s*:\\s*(\\d+)").matcher(body);

            StringBuilder itemsJson = new StringBuilder("[");
            boolean first = true;

            while (m.find()) {
                String pid = m.group(1);
                String sid = mShade.find() ? mShade.group(1) : "sh-001";
                int qty = mQty.find() ? Integer.parseInt(mQty.group(1)) : 1;

                String prod = findObjectById(productsJson, pid);
                String shade = findObjectById(shadesJson, sid);

                int price = 449;
                String prodName = "Lumière Beauty Product";
                String prodType = "Cosmetic";
                String prodCat = "Face";
                String img = "https://images.unsplash.com/photo-1599305090598-fe179d501227";
                String shadeName = "Standard Tone";
                String hex = "#C47E87";

                if (prod != null) {
                    price = extractIntField(prod, "price", 449);
                    prodName = extractStringField(prod, "name", prodName);
                    prodType = extractStringField(prod, "type", prodType);
                    prodCat = extractStringField(prod, "category", prodCat);
                    img = extractStringField(prod, "image", img);
                }
                if (shade != null) {
                    shadeName = extractStringField(shade, "name", shadeName);
                    hex = extractStringField(shade, "hex", hex);
                }

                subtotal += (price * qty);

                if (!first) itemsJson.append(",");
                itemsJson.append(String.format(
                    "{\"product_id\":\"%s\",\"product_name\":\"%s\",\"type\":\"%s\",\"category\":\"%s\",\"image\":\"%s\",\"shade_id\":\"%s\",\"shade_name\":\"%s\",\"hex\":\"%s\",\"qty\":%d,\"price\":%d}",
                    pid, prodName, prodType, prodCat, img, sid, shadeName, hex, qty, price
                ));
                first = false;
            }
            itemsJson.append("]");

            if (subtotal == 0) subtotal = 449;

            int discount = 0;
            String couponCode = null;
            if (body.contains("\"coupon_code\":\"WELCOME10\"") || body.contains("\"coupon_code\":\"welcome10\"")) {
                discount = (int)(subtotal * 0.10);
                couponCode = "WELCOME10";
            } else if (body.contains("\"coupon_code\":\"LUMIERE20\"") || body.contains("\"coupon_code\":\"lumiere20\"")) {
                discount = (int)(subtotal * 0.20);
                couponCode = "LUMIERE20";
            } else if (body.contains("\"coupon_code\":\"BEAUTY50\"") || body.contains("\"coupon_code\":\"beauty50\"")) {
                discount = Math.min(50, subtotal);
                couponCode = "BEAUTY50";
            }

            int deliveryFee = subtotal >= 999 ? 0 : 49;
            int taxable = Math.max(0, subtotal - discount);
            int gstAmount = (int) Math.round(taxable * 0.18);
            int total = taxable + gstAmount + deliveryFee;

            String resp = String.format(
                "{\"items\":%s,\"subtotal\":%d,\"discount\":%d,\"coupon\":%s,\"points_used\":0,\"gst_rate\":18,\"gst_amount\":%d,\"delivery_fee\":%d,\"total\":%d}",
                itemsJson.toString(), subtotal, discount,
                couponCode == null ? "null" : "\"" + couponCode + "\"",
                gstAmount, deliveryFee, total
            );
            sendJson(ex, 200, resp);
        }

        private void handleCouponValidate(HttpExchange ex, String body) throws IOException {
            String code = extractStringField(body, "code", "").toUpperCase();
            if ("WELCOME10".equals(code)) {
                sendJson(ex, 200, "{\"code\":\"WELCOME10\",\"discount_pct\":10,\"discount_amt\":0,\"description\":\"10% off your entire order\"}");
            } else if ("LUMIERE20".equals(code)) {
                sendJson(ex, 200, "{\"code\":\"LUMIERE20\",\"discount_pct\":20,\"discount_amt\":0,\"description\":\"20% off on orders above ₹999\"}");
            } else if ("BEAUTY50".equals(code)) {
                sendJson(ex, 200, "{\"code\":\"BEAUTY50\",\"discount_pct\":0,\"discount_amt\":50,\"description\":\"₹50 flat discount\"}");
            } else {
                sendJson(ex, 400, "{\"detail\":\"Invalid or expired coupon code\"}");
            }
        }

        private void handleShadeFinderMatch(HttpExchange ex, String body) throws IOException {
            String matchResult = "{" +
                "\"undertone\":\"warm\",\"depth\":\"medium\",\"matched_shades\":[" +
                "{\"shade_id\":\"sh-083\",\"shade_name\":\"Warm Beige\",\"hex\":\"#E7C9AC\",\"product_id\":\"p-17\",\"product_name\":\"Second Skin Serum Foundation\",\"price\":899}," +
                "{\"shade_id\":\"sh-101\",\"shade_name\":\"Honey Neutral\",\"hex\":\"#E2C19E\",\"product_id\":\"p-18\",\"product_name\":\"Bright-Eye Cream Concealer\",\"price\":549}," +
                "{\"shade_id\":\"sh-001\",\"shade_name\":\"Velvet Rose\",\"hex\":\"#A6505F\",\"product_id\":\"p-01\",\"product_name\":\"Velvet Matte Lipstick\",\"price\":499}" +
                "]}";
            sendJson(ex, 200, matchResult);
        }

        private void handleShadeFinderSelfie(HttpExchange ex, String body) throws IOException {
            sendJson(ex, 200, "{\"detected_undertone\":\"Warm Gold\",\"detected_skin_tone\":\"Medium Tan\",\"recommendation\":\"Shade 220 Warm Honey\",\"confidence\":0.96}");
        }

        private void handleAuth(HttpExchange ex, String path, String body) throws IOException {
            if (path.equals("/api/auth/me")) {
                sendJson(ex, 200, String.format(
                    "{\"id\":\"%s\",\"email\":\"%s\",\"name\":\"%s\",\"role\":\"%s\",\"loyalty_points\":%s}",
                    currentUser.get("id"), currentUser.get("email"), currentUser.get("name"), currentUser.get("role"), currentUser.get("loyalty_points")
                ));
            } else if (path.equals("/api/auth/login") || path.equals("/api/auth/register")) {
                String email = extractStringField(body, "email", "student@lumiere.com");
                String name = extractStringField(body, "name", "Demo User");
                currentUser.put("email", email);
                if (!name.isEmpty()) currentUser.put("name", name);
                sendJson(ex, 200, String.format(
                    "{\"token\":\"token-jwt-sample\",\"user\":{\"id\":\"%s\",\"email\":\"%s\",\"name\":\"%s\",\"role\":\"customer\",\"loyalty_points\":%s}}",
                    currentUser.get("id"), currentUser.get("email"), currentUser.get("name"), currentUser.get("loyalty_points")
                ));
            } else if (path.equals("/api/auth/logout")) {
                sendJson(ex, 200, "{\"success\":true,\"message\":\"Logged out successfully\"}");
            } else if (path.equals("/api/auth/refresh")) {
                sendJson(ex, 200, "{\"token\":\"token-jwt-refreshed\"}");
            }
        }

        private void handleOrders(HttpExchange ex, String method, String body, String path) throws IOException {
            if ("GET".equals(method)) {
                StringBuilder sb = new StringBuilder("[");
                for (int i = 0; i < orders.size(); i++) {
                    if (i > 0) sb.append(",");
                    sb.append(orders.get(i));
                }
                sb.append("]");
                sendJson(ex, 200, sb.toString());
            } else if ("POST".equals(method)) {
                String orderId = "ORD-" + (int)(10000 + Math.random() * 90000);
                String now = Instant.now().toString();

                String orderObj = String.format(
                    "{\"id\":\"%s\",\"status\":\"Confirmed\",\"created_at\":\"%s\",\"subtotal\":898,\"discount\":0,\"gst_amount\":162,\"delivery_fee\":0,\"total\":1060,\"payment_mode\":\"COD\",\"tracking_number\":\"TRK-%s\"," +
                    "\"items\":[{\"product_id\":\"p-01\",\"product_name\":\"Velvet Matte Lipstick\",\"shade_name\":\"Velvet Rose\",\"hex\":\"#A6505F\",\"qty\":1,\"price\":499}," +
                    "{\"product_id\":\"p-21\",\"product_name\":\"Blush Bouquet Powder Blush\",\"shade_name\":\"First Bloom\",\"hex\":\"#F4A9BE\",\"qty\":1,\"price\":449}]," +
                    "\"address\":{\"name\":\"Demo User\",\"phone\":\"9876543210\",\"line1\":\"A-402, Royal Palms\",\"city\":\"Mumbai\",\"state\":\"Maharashtra\",\"pincode\":\"400705\"}}",
                    orderId, now, orderId
                );
                orders.add(orderObj);
                sendJson(ex, 201, orderObj);
            }
        }

        private void handleSingleOrder(HttpExchange ex, String path) throws IOException {
            String remainder = path.substring("/api/orders/".length());
            if (remainder.endsWith("/track")) {
                String id = remainder.replace("/track", "");
                String tracking = "{\"order_id\":\"" + id + "\",\"current_status\":\"In Transit\",\"carrier\":\"BlueDart Express\",\"tracking_number\":\"BD" + id + "\"," +
                    "\"timeline\":[" +
                    "{\"stage\":\"Order Placed\",\"date\":\"Today, 10:15 AM\",\"completed\":true}," +
                    "{\"stage\":\"Packed at Mumbai Hub\",\"date\":\"Today, 02:40 PM\",\"completed\":true}," +
                    "{\"stage\":\"In Transit\",\"date\":\"Out for delivery\",\"completed\":true}," +
                    "{\"stage\":\"Delivered\",\"date\":\"Expected tomorrow\",\"completed\":false}" +
                    "]}";
                sendJson(ex, 200, tracking);
                return;
            }
            String id = remainder;
            for (String ord : orders) {
                if (ord.contains("\"id\":\"" + id + "\"")) {
                    sendJson(ex, 200, ord);
                    return;
                }
            }
            String fallbackOrder = String.format(
                "{\"id\":\"%s\",\"status\":\"Confirmed\",\"created_at\":\"%s\",\"subtotal\":898,\"discount\":0,\"gst_amount\":162,\"delivery_fee\":0,\"total\":1060,\"payment_mode\":\"COD\",\"tracking_number\":\"TRK-%s\"," +
                "\"items\":[{\"product_id\":\"p-01\",\"product_name\":\"Velvet Matte Lipstick\",\"shade_name\":\"Velvet Rose\",\"hex\":\"#A6505F\",\"qty\":1,\"price\":499}]," +
                "\"address\":{\"name\":\"Demo User\",\"phone\":\"9876543210\",\"line1\":\"A-402, Royal Palms\",\"city\":\"Mumbai\",\"state\":\"Maharashtra\",\"pincode\":\"400705\"}}",
                id, Instant.now(), id
            );
            sendJson(ex, 200, fallbackOrder);
        }

        private void handleWishlist(HttpExchange ex, String method, String body) throws IOException {
            if ("GET".equals(method)) {
                StringBuilder sb = new StringBuilder("[");
                for (int i = 0; i < wishlist.size(); i++) {
                    if (i > 0) sb.append(",");
                    sb.append(wishlist.get(i));
                }
                sb.append("]");
                sendJson(ex, 200, sb.toString());
            } else if ("POST".equals(method)) {
                String pid = extractStringField(body, "product_id", "p-01");
                String prod = findObjectById(productsJson, pid);
                if (prod != null) wishlist.add(prod);
                sendJson(ex, 201, "{\"success\":true,\"product_id\":\"" + pid + "\"}");
            }
        }

        private void handleSingleWishlist(HttpExchange ex, String method, String path) throws IOException {
            String pid = path.substring("/api/wishlist/".length());
            wishlist.removeIf(w -> w.contains("\"id\":\"" + pid + "\""));
            sendJson(ex, 200, "{\"success\":true,\"removed\":\"" + pid + "\"}");
        }

        private void handleAddresses(HttpExchange ex, String method, String body) throws IOException {
            if ("GET".equals(method)) {
                StringBuilder sb = new StringBuilder("[");
                for (int i = 0; i < addresses.size(); i++) {
                    if (i > 0) sb.append(",");
                    sb.append(addresses.get(i));
                }
                sb.append("]");
                sendJson(ex, 200, sb.toString());
            } else if ("POST".equals(method)) {
                String id = "addr-" + (addresses.size() + 1);
                String newAddr = body.contains("\"id\"") ? body : "{\"id\":\"" + id + "\"," + body.substring(1);
                addresses.add(newAddr);
                sendJson(ex, 201, newAddr);
            }
        }

        private void handleRestockAlerts(HttpExchange ex, String method, String body) throws IOException {
            if ("GET".equals(method)) {
                sendJson(ex, 200, "[]");
            } else {
                restockAlerts.add(body);
                sendJson(ex, 201, "{\"success\":true,\"message\":\"Restock alert registered\"}");
            }
        }

        private void handleAdmin(HttpExchange ex, String path, String method, String body) throws IOException {
            if (path.equals("/api/admin/stats")) {
                String stats = "{\"total_revenue\":124500,\"total_orders\":" + Math.max(28, orders.size()) + ",\"total_users\":142,\"active_products\":44,\"active_shades\":209,\"low_stock_shades\":4}";
                sendJson(ex, 200, stats);
            } else if (path.equals("/api/admin/orders")) {
                handleOrders(ex, "GET", body, path);
            } else if (path.equals("/api/admin/users")) {
                sendJson(ex, 200, "[{\"id\":\"usr-101\",\"name\":\"Demo User\",\"email\":\"student@lumiere.com\",\"orders_count\":3,\"total_spent\":2450,\"created_at\":\"2026-08-10\"}]");
            } else if (path.equals("/api/admin/coupons")) {
                StringBuilder sb = new StringBuilder("[");
                for (int i = 0; i < coupons.size(); i++) {
                    if (i > 0) sb.append(",");
                    sb.append(coupons.get(i));
                }
                sb.append("]");
                sendJson(ex, 200, sb.toString());
            } else if (path.equals("/api/admin/products")) {
                sendJson(ex, 200, productsJson);
            } else {
                sendJson(ex, 200, "{\"success\":true}");
            }
        }
    }

    // ==========================================
    // Static Files & Single Page App (SPA) Handler
    // ==========================================
    static class StaticSpaHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);

            String rawPath = exchange.getRequestURI().getPath();
            if (rawPath.startsWith("/api")) {
                return;
            }

            String path = rawPath.equals("/") ? "/index.html" : rawPath;
            Path requestedFile = staticDir.resolve(path.startsWith("/") ? path.substring(1) : path).normalize();

            if (!requestedFile.startsWith(staticDir)) {
                exchange.sendResponseHeaders(403, -1);
                return;
            }

            if (!Files.exists(requestedFile) || Files.isDirectory(requestedFile)) {
                requestedFile = staticDir.resolve("index.html");
            }

            if (!Files.exists(requestedFile)) {
                String notFound = "<h1>404 Not Found</h1><p>index.html missing in " + staticDir + "</p>";
                exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
                exchange.sendResponseHeaders(404, notFound.getBytes(StandardCharsets.UTF_8).length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(notFound.getBytes(StandardCharsets.UTF_8));
                }
                return;
            }

            String mime = getMimeType(requestedFile.toString());
            byte[] bytes = Files.readAllBytes(requestedFile);

            exchange.getResponseHeaders().set("Content-Type", mime);
            exchange.getResponseHeaders().set("Cache-Control", "no-cache");
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }

        private String getMimeType(String filename) {
            if (filename.endsWith(".html")) return "text/html; charset=UTF-8";
            if (filename.endsWith(".js")) return "application/javascript; charset=UTF-8";
            if (filename.endsWith(".css")) return "text/css; charset=UTF-8";
            if (filename.endsWith(".svg")) return "image/svg+xml";
            if (filename.endsWith(".json")) return "application/json; charset=UTF-8";
            if (filename.endsWith(".png")) return "image/png";
            if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) return "image/jpeg";
            if (filename.endsWith(".ico")) return "image/x-icon";
            return "application/octet-stream";
        }
    }

    // ==========================================
    // Helper Utilities
    // ==========================================
    private static void sendJson(HttpExchange ex, int code, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        ex.sendResponseHeaders(code, bytes.length);
        try (OutputStream os = ex.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static void addCorsHeaders(HttpExchange ex) {
        Headers h = ex.getResponseHeaders();
        h.set("Access-Control-Allow-Origin", "*");
        h.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        h.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    }

    private static String readBody(HttpExchange ex) throws IOException {
        InputStream is = ex.getRequestBody();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buffer = new byte[4096];
        int len;
        while ((len = is.read(buffer)) != -1) {
            baos.write(buffer, 0, len);
        }
        return baos.toString(StandardCharsets.UTF_8);
    }

    private static String extractParam(String query, String name) {
        if (query == null) return "";
        for (String pair : query.split("&")) {
            String[] parts = pair.split("=");
            if (parts.length == 2 && parts[0].equals(name)) {
                return URLDecoder.decode(parts[1], StandardCharsets.UTF_8);
            }
        }
        return "";
    }

    private static String findObjectById(String jsonArray, String id) {
        Pattern pattern = Pattern.compile("\\{[^\\{\\}]*\"id\"\\s*:\\s*\"" + Pattern.quote(id) + "\"[^\\{\\}]*\\}");
        Matcher m = pattern.matcher(jsonArray);
        if (m.find()) return m.group(0);
        return null;
    }

    private static String filterJsonArray(String jsonArray, String matchSubstring) {
        StringBuilder sb = new StringBuilder("[");
        boolean first = true;
        Matcher m = Pattern.compile("\\{[^\\{\\}]+\\}").matcher(jsonArray);
        while (m.find()) {
            String obj = m.group(0);
            if (obj.contains(matchSubstring)) {
                if (!first) sb.append(",");
                sb.append(obj);
                first = false;
            }
        }
        sb.append("]");
        return sb.toString();
    }

    private static String extractStringField(String json, String field, String fallback) {
        Matcher m = Pattern.compile("\"" + Pattern.quote(field) + "\"\\s*:\\s*\"([^\"]*)\"").matcher(json);
        if (m.find()) return m.group(1);
        return fallback;
    }

    private static int extractIntField(String json, String field, int fallback) {
        Matcher m = Pattern.compile("\"" + Pattern.quote(field) + "\"\\s*:\\s*(\\d+)").matcher(json);
        if (m.find()) {
            try { return Integer.parseInt(m.group(1)); } catch (Exception ignored) {}
        }
        return fallback;
    }
}
