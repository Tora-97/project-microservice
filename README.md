# ThreadCraft - Hệ Thống Microservices Bán Quần Áo (Cloth Shop)

Chào mừng bạn đến với dự án **ThreadCraft**, hệ thống thương mại điện tử chuyên cung cấp quần áo thời trang được xây dựng trên kiến trúc **Microservices** hiện đại, kết hợp giữa backend Java Spring Boot và frontend Next.js (React).

---

## 🛠 Kiến Trúc Hệ Thống & Cấu Trúc Mã Nguồn

Hệ thống được chia nhỏ thành các dịch vụ độc lập (microservices) giúp dễ dàng phát triển, mở rộng và bảo trì:

*   **`frontend`**: Giao diện người dùng được xây dựng bằng Next.js (React), hỗ trợ đầy đủ các tính năng duyệt sản phẩm, tìm kiếm, giỏ hàng, đặt hàng, quản lý đơn hàng và trang quản trị (Admin).
*   **`api-gateway`**: Cổng kết nối duy nhất (API Gateway) xử lý định tuyến (routing) các yêu cầu từ Client tới các dịch vụ microservices thích hợp và cấu hình CORS dùng chung.
*   **`config-server`**: Dịch vụ quản lý cấu hình tập trung (Spring Cloud Config Server), cung cấp file thuộc tính (`.properties`) cho các dịch vụ khác.
*   **`auth-service`**: Quản lý tài khoản người dùng, phân quyền (Role-based access control) và xác thực JWT (Login, Register).
*   **`product-service`**: Quản lý thông tin chi tiết sản phẩm, các biến thể sản phẩm (size, color, stock) và upload hình ảnh sản phẩm.
*   **`category-service`**: Quản lý các danh mục sản phẩm (Tops, Bottoms, Accessories, v.v.).
*   **`discount-service`**: Quản lý các mã giảm giá (voucher) và chương trình khuyến mãi.
*   **`order-service`**: Xử lý tạo đơn hàng, quản lý trạng thái đơn hàng và chi tiết các mục trong đơn hàng.
*   **`sqlserver-init`**: Thư mục chứa các tệp lệnh shell tự động tạo lập cơ sở dữ liệu trên SQL Server.

---

## 🔌 Cổng Kết Nối Các Dịch Vụ (Port Mapping)

| Tên Dịch Vụ | Cổng (Port) | Mô tả |
| :--- | :--- | :--- |
| **`sqlserver`** | `1433` | Cơ sở dữ liệu Microsoft SQL Server 2022 |
| **`config-server`** | `8888` | Spring Cloud Config Server (Centralized Config) |
| **`api-gateway`** | `8080` | Spring Cloud API Gateway (Cổng API chính) |
| **`auth-service`** | `8081` | Dịch vụ xác thực tài khoản & người dùng |
| **`product-service`**| `8082` | Dịch vụ quản lý sản phẩm & hình ảnh |
| **`order-service`** | `8083` | Dịch vụ quản lý đơn hàng |
| **`category-service`**| `8084` | Dịch vụ quản lý danh mục sản phẩm |
| **`discount-service`**| `8085` | Dịch vụ quản lý mã giảm giá |
| **`frontend`** | `3000` | Giao diện người dùng Next.js (chạy local) |

---

## 📋 Yêu Cầu Hệ Thống (Prerequisites)

Trước khi bắt đầu cài đặt, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Khuyên dùng để cài đặt nhanh nhất)
*   [Node.js (phiên bản v18 trở lên)](https://nodejs.org/) & `npm`
*   [Java Development Kit (JDK) 17](https://www.oracle.com/java/technologies/downloads/#java17) (Nếu muốn chạy thủ công không dùng Docker)
*   [Apache Maven 3.8+](https://maven.apache.org/) (Nếu muốn chạy thủ công không dùng Docker)

---

## 🚀 Hướng Dẫn Cài Đặt và Khởi Chạy Nhanh (Sử Dụng Docker Compose)

Đây là cách nhanh nhất và đơn giản nhất để chạy toàn bộ hệ thống (bao gồm database, các microservices backend và cổng kết nối) thông qua một lệnh duy nhất.

### Bước 1: Khởi động toàn bộ Backend & Database bằng Docker Compose

Mở terminal tại thư mục gốc của dự án (`clothe-shop-microservices`) và chạy lệnh sau:

```bash
docker compose up --build -d
```

*Lưu ý: Lệnh này sẽ tự động xây dựng các Docker image cho từng microservice và khởi chạy chúng cùng với SQL Server.*

### Bước 2: Kiểm tra trạng thái các container

Để đảm bảo tất cả các dịch vụ đã hoạt động bình thường, hãy chạy:

```bash
docker compose ps
```

Các dịch vụ sẽ hiển thị trạng thái `running` (hoặc `healthy` đối với database).

### Bước 3: Nạp dữ liệu mẫu (Seed Data) vào Cơ sở dữ liệu

Dự án đã chuẩn bị sẵn file `seed.sql` ở thư mục gốc để khởi tạo dữ liệu mẫu về Danh mục, Sản phẩm, Biến thể và Mã giảm giá. 

Để nạp dữ liệu này vào container SQL Server đang chạy, bạn chỉ cần thực thi lệnh sau trên Terminal (ở thư mục gốc):

```bash
docker exec -i sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -C < seed.sql
```

*(Lệnh trên sẽ kết nối trực tiếp vào container SQL Server và chạy toàn bộ mã SQL trong tệp `seed.sql` để thiết lập dữ liệu ban đầu cho các database).*

### Bước 4: Khởi chạy Giao diện Frontend (Next.js)

1. Mở một cửa sổ Terminal mới và di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Chạy frontend ở môi trường phát triển:
   ```bash
   npm run dev
   ```
4. Giao diện người dùng sẽ được khởi chạy tại địa chỉ: **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ Hướng Dẫn Khởi Chạy Thủ Công (Chạy Local Từng Phần)

Nếu bạn không sử dụng Docker cho toàn bộ hệ thống hoặc muốn debug mã nguồn backend cục bộ, hãy làm theo các bước dưới đây:

### Bước 1: Khởi chạy và thiết lập Database SQL Server cục bộ

1. Khởi chạy máy chủ Microsoft SQL Server cục bộ của bạn trên cổng mặc định `1433`.
2. Tạo 5 cơ sở dữ liệu sau bằng SQL client của bạn (như SSMS, Azure Data Studio, DBeaver):
   *   `clothing_auth_db`
   *   `clothing_product_db`
   *   `clothing_order_db`
   *   `clothing_category_db`
   *   `clothing_discount_db`
3. Thực thi toàn bộ lệnh trong tệp `seed.sql` trên SQL Client của bạn để nạp dữ liệu mẫu ban đầu.

### Bước 2: Chạy Spring Cloud Config Server

*Config Server phải được khởi chạy trước tiên vì các microservices khác sẽ tải các cấu hình cần thiết từ đây.*

1. Di chuyển vào thư mục `config-server`:
   ```bash
   cd config-server
   ```
2. Chạy dịch vụ bằng Maven Wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```

### Bước 3: Chạy các Dịch Vụ Microservices Backend

Mở từng terminal riêng biệt cho các dịch vụ dưới đây, di chuyển vào thư mục tương ứng và khởi chạy bằng Maven:

*   **Auth Service**:
    ```bash
    cd auth-service
    ./mvnw spring-boot:run
    ```
*   **Product Service**:
    ```bash
    cd product-service
    ./mvnw spring-boot:run
    ```
*   **Order Service**:
    ```bash
    cd order-service
    ./mvnw spring-boot:run
    ```
*   **Category Service**:
    ```bash
    cd category-service
    ./mvnw spring-boot:run
    ```
*   **Discount Service**:
    ```bash
    cd discount-service
    ./mvnw spring-boot:run
    ```

### Bước 4: Chạy API Gateway

*API Gateway được cấu hình để định tuyến các API, hãy chạy service này sau khi các microservices khác đã sẵn sàng.*

1. Di chuyển vào thư mục `api-gateway`:
   ```bash
   cd api-gateway
   ```
2. Khởi chạy bằng Maven:
   ```bash
   ./mvnw spring-boot:run
   ```

### Bước 5: Chạy Giao Diện Frontend (Next.js)

1. Di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
2. Thực hiện cài đặt dependencies và chạy:
   ```bash
   npm install
   npm run dev
   ```
3. Truy cập **[http://localhost:3000](http://localhost:3000)** để kiểm tra giao diện.

---

## ⚡ Các Điểm Cuối API Cơ Bản (Core API Endpoints)

Tất cả các cuộc gọi API từ client sẽ đi qua API Gateway cổng `8080`. Dưới đây là các định tuyến chính:

*   **Xác thực / Người dùng**: `http://localhost:8080/api/v1/auth` (Đăng nhập `/login`, Đăng ký `/register`) hoặc `/api/v1/users`
*   **Sản phẩm**: `http://localhost:8080/api/v1/products`
*   **Danh mục**: `http://localhost:8080/api/v1/categories`
*   **Đơn hàng**: `http://localhost:8080/api/v1/orders`
*   **Mã giảm giá**: `http://localhost:8080/api/v1/discounts`
*   **Ảnh tải lên**: `http://localhost:8080/uploads/{tên_ảnh}`

---

## 💡 Lưu Ý & Giải Quyết Sự Cố

1. **Lỗi kết nối SQL Server**: Đảm bảo thông tin cấu hình cổng `1433` và mật khẩu SA trong file `compose.yaml` (hoặc cấu hình local của bạn) trùng khớp.
2. **Khởi chạy Docker Compose bị kẹt**: Nếu các microservice chạy trước khi SQL Server khởi động hoàn tất, tính năng `healthcheck` trong `compose.yaml` đã được thiết lập để đảm bảo thứ tự khởi chạy (các service chỉ khởi chạy khi container SQL Server ở trạng thái `healthy`). Hãy chờ vài phút để hệ thống đồng bộ lần đầu tiên.
3. **Cập nhật hình ảnh**: Thư mục ảnh tải lên `/app/uploads` của `product-service` đã được mount qua Docker volume `product_images` cục bộ để đảm bảo ảnh không bị mất khi container khởi động lại.
