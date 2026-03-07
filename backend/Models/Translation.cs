using System.ComponentModel.DataAnnotations;

public class Translation
{
    [Key]
    public string translation_id { get; set; }

    public string store_id { get; set; }
    public string language_id { get; set; }
    public string food_id { get; set; }
    public string food_name { get; set; }
    public string description { get; set; }
    public string audio_url { get; set; }
}