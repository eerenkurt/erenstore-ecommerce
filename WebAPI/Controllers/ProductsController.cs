using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ErenStore.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        // 1. HERKESE AÇIK: Tüm Ürünleri Listele
        // GET: api/products
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _productService.GetAllProductsAsync(); // Bizim servis metodumuz
            return Ok(products);
        }

        // 2. HERKESE AÇIK: ID'ye Göre Ürün Detayı Getir
        // GET: api/products/{id}
        [HttpGet("{id:int}")] // Projedeki ID tipine göre int veya long yapabilirsin
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
                return NotFound(new { message = $"ID'si {id} olan ürün bulunamadı." });

            return Ok(product);
        }

        // 3. SATICIYA ÖZEL: Yeni Ürün Ekle
        // POST: api/products
        [Authorize(Roles = "Seller")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserIdFromToken();
            
            // Ürünü ekleyen satıcının ID'sini token'dan güvenli bir şekilde alıp servise veriyoruz
            var createdProduct = await _productService.CreateProductAsync(userId, dto);
            
            return StatusCode(201, new { 
                message = "Ürün başarıyla oluşturuldu ve kataloğa eklendi.", 
                data = createdProduct 
            });
        }

        // 4. SATICIYA ÖZEL: Ürün Güncelle (IDOR Korumalı)
        // PUT: api/products
        [Authorize(Roles = "Seller")]
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateProductDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserIdFromToken();
            
            // IDOR Koruması: Servis katmanı, bu userId'nin bu ürüne yetkisi var mı diye kontrol edecek
            var result = await _productService.UpdateProductAsync(userId, dto);
            if (!result)
                return NotFound(new { message = "Güncellenmek istenen ürün bulunamadı veya bu işlem için yetkiniz yok." });

            return Ok(new { message = "Ürün başarıyla güncellendi." });
        }

        // 5. SATICIYA ÖZEL: Ürün Sil (Soft-Delete & IDOR Korumalı)
        // DELETE: api/products/{id}
        [Authorize(Roles = "Seller")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetUserIdFromToken();
            
            // IDOR Koruması: Sadece ürünü yükleyen satıcı silebilir (veya admin)
            var result = await _productService.DeleteProductAsync(userId, id);
            if (!result)
                return NotFound(new { message = "Silinmek istenen ürün bulunamadı veya bu işlem için yetkiniz yok." });

            return Ok(new { message = "Ürün başarıyla silindi." });
        }

        // 6. SATICIYA ÖZEL: Sadece Giriş Yapan Satıcının Kendi Ürünlerini Listele
        // GET: api/products/my-products
        [Authorize(Roles = "Seller")]
        [HttpGet("my-products")]
        public async Task<IActionResult> GetMyProducts()
        {
            var userId = GetUserIdFromToken();
            var products = await _productService.GetProductsBySellerIdAsync(userId);
            return Ok(products);
        }

        // JWT Token'dan Güvenli Şekilde NameIdentifier (UserId) Çeken Yardımcı Metot
        private int GetUserIdFromToken()
        {
            // HttpContext.User, istek atan kişinin çözülmüş token bilgilerini tutar
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
    
            if (userIdClaim == null)
            {
                throw new UnauthorizedAccessException("Token geçersiz veya User ID bulunamadı.");
            }
    
            return int.Parse(userIdClaim.Value);
        }
    }
}