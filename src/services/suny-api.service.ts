import axios, {AxiosInstance} from 'axios';
import { XMLParser } from 'fast-xml-parser';

const { SUNY_API_URL } = process.env;

export class SunyApiService {
  private readonly api: AxiosInstance;
  constructor() {
    this.api = axios.create({
      baseURL: SUNY_API_URL.replace(/\/$/, ''),
    })
  }

  async removeMailing(leadId: number) {
    const res = await this.api.get(`CACHE1/PERSONALX.REST.cls?soap_method=RemoveMailing&IDNumber=${leadId}`);
    const parser = new XMLParser();
    const data = parser.parse(res.data, {});
    console.log(data);
    return data;
  }
}
