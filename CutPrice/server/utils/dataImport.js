const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const importDataFromFile = async (file, type) => {
  try {
    // Upload file to Supabase Storage
    const fileName = `${type}-${Date.now()}.jsonl`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('data-uploads')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get the file URL
    const { data: { publicUrl } } = supabase.storage
      .from('data-uploads')
      .getPublicUrl(fileName);

    // Process the uploaded file
    const { data, error } = await supabase.rpc('process_uploaded_file', {
      file_path: fileName,
      data_type: type
    });

    if (error) throw error;

    return {
      success: true,
      message: `Successfully imported ${type} data`,
      details: data
    };
  } catch (error) {
    console.error(`Error importing ${type} data:`, error);
    return {
      success: false,
      message: `Failed to import ${type} data`,
      error: error.message
    };
  }
};

module.exports = { importDataFromFile }; 