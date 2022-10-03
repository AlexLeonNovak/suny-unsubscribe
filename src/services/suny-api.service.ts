import axios, {AxiosInstance} from 'axios';
import { XMLParser } from 'fast-xml-parser';

const { SUNY_API_URL } = process.env;

const STATUS = {
  0: 'No subscription',
  1: 'Removed successfully',
  4: 'Error',
  9: 'Customer id does not exist',
}

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
    const status = data['SOAP-ENV\:Envelope']['SOAP-ENV\:Body']['RemoveMailingResponse']['RemoveMailingResult'] || 4;
    return STATUS[status];
  }
}
