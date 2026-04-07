public class SupabaseStorageService
{
    private readonly HttpClient _http;
    private readonly string _baseUrl;
    private readonly string _bucketName;

    public SupabaseStorageService(IConfiguration config)
    {
        _baseUrl = config["Supabase:Url"]!;
        _bucketName = config["Supabase:BucketName"]!;
        var key = config["Supabase:Key"]!;

        _http = new HttpClient();
        _http.DefaultRequestHeaders.Add("apikey", key);
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {key}");
    }

    // Upload file lên Supabase Storage, trả về public URL
    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType)
    {
        var uniqueName = Guid.NewGuid() + Path.GetExtension(fileName);
        var url = $"{_baseUrl}/storage/v1/object/{_bucketName}/{uniqueName}";

        var content = new StreamContent(fileStream);
        content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);

        var response = await _http.PostAsync(url, content);
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync();
            throw new Exception($"Upload Supabase thất bại: {err}");
        }

        // Trả về public URL để lưu vào bảng images
        return $"{_baseUrl}/storage/v1/object/public/{_bucketName}/{uniqueName}";
    }

    // Xóa ảnh cũ trên Supabase Storage
    public async Task DeleteAsync(string publicUrl)
    {
        if (string.IsNullOrEmpty(publicUrl)) return;
        var fileName = publicUrl.Split($"{_bucketName}/").Last();
        var url = $"{_baseUrl}/storage/v1/object/{_bucketName}/{fileName}";
        await _http.DeleteAsync(url);
    }
}