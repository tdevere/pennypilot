import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OPENAI_API_KEY_STORAGE = '@pennypilot_openai_key';

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ReceiptData {
  merchant: string;
  amount: number;
  date: string;
  category: string;
  items?: ReceiptItem[];
  confidence: number;
}

class OpenAIService {
  private apiKey: string | null = null;

  async init() {
    this.apiKey = await AsyncStorage.getItem(OPENAI_API_KEY_STORAGE);
  }

  async setApiKey(key: string) {
    this.apiKey = key;
    await AsyncStorage.setItem(OPENAI_API_KEY_STORAGE, key);
  }

  async getApiKey(): Promise<string | null> {
    if (!this.apiKey) {
      this.apiKey = await AsyncStorage.getItem(OPENAI_API_KEY_STORAGE);
    }
    return this.apiKey;
  }

  async hasApiKey(): Promise<boolean> {
    const key = await this.getApiKey();
    return !!key;
  }

  async analyzeReceipt(imageBase64: string): Promise<ReceiptData> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not set. Please configure it in Settings.');
    }

    try {
      console.log('Sending request to OpenAI API...');
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini', // Using gpt-4o-mini for cost efficiency
          messages: [
            {
              role: 'system',
              content: `You are a receipt analyzer. Extract transaction details from receipt images and return ONLY valid JSON with this exact structure:
{
  "merchant": "store name",
  "amount": 0.00,
  "date": "YYYY-MM-DD",
  "category": "one of: Food, Transportation, Shopping, Entertainment, Bills, Healthcare, Other",
  "items": [
    {
      "name": "item name",
      "quantity": 1.0,
      "unitPrice": 0.00,
      "totalPrice": 0.00
    }
  ],
  "confidence": 0.0-1.0
}
Extract individual line items with their quantities and prices when possible. If you cannot read the receipt clearly, set confidence below 0.5 and use your best guess for missing fields.`,
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extract the transaction details from this receipt.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 300,
          temperature: 0.1,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 30000,
        }
      );

      console.log('OpenAI API response received');
      const content = response.data.choices[0].message.content;
      console.log('OpenAI response content:', content);
      
      // Remove markdown code fences if present
      let jsonString = content.trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/```\n?/g, '');
      }
      
      // Parse the JSON response
      const parsed = JSON.parse(jsonString.trim());
      
      // Validate and normalize the data
      return {
        merchant: parsed.merchant || 'Unknown Merchant',
        amount: parseFloat(parsed.amount) || 0,
        date: parsed.date || new Date().toISOString().split('T')[0],
        category: this.validateCategory(parsed.category),
        items: Array.isArray(parsed.items) ? parsed.items : [],
        confidence: parseFloat(parsed.confidence) || 0.5,
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        
        if (error.response?.status === 401) {
          throw new Error('Invalid API key. Please check your OpenAI API key in Settings.');
        }
        if (error.response?.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        }
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout. Please check your internet connection and try again.');
        }
        
        const errorMessage = error.response?.data?.error?.message || error.message;
        throw new Error(`API Error: ${errorMessage}`);
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to analyze receipt: ${error.message}`);
      }
      
      throw new Error('Failed to analyze receipt. Please try again.');
    }
  }

  private validateCategory(category: string): string {
    const validCategories = [
      'Food',
      'Transportation',
      'Shopping',
      'Entertainment',
      'Bills',
      'Healthcare',
      'Other',
    ];
    
    const normalized = category?.trim();
    return validCategories.includes(normalized) ? normalized : 'Other';
  }
}

export const openAIService = new OpenAIService();
