import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class HomeService {

    getBannerList(): Array<string> {
        return [
            
            'assets/images/list/jf-imp1.jpg',
            'assets/images/list/jf-imp2.jpg',
            // 'assets/images/list/jf-farm0.jpg',
            // 'assets/images/list/jf-farm1.jpg',
            'assets/images/list/jf-farm2.jpg',
            // 'assets/images/list/jf-farm3.jpg',
            'assets/images/list/jf-farm4.jpg',
            'assets/images/list/jf-farm5.jpg',
            // 'assets/images/list/jf-farm6.jpg',
            // 'assets/images/list/jf-imp.png',
            // 'assets/images/list/jf-farm7.jpg',
            // 'assets/images/list/jf-farm8.jpg',
            // 'assets/images/list/jf-farm9.jpg',
            // // 'assets/images/list/jf-farm10.jpg',
            // 'assets/images/list/jf-farm11.jpg',
        ];
    }

    getList(): Array<any> {
        return [
            {
                avatar: 'assets/images/avatar/2.png',
                author: 'Pranita Pande',
                cate: 'My Home Jewel, Madinaguda',
                date: 'Apr 22, 2022',
                title: 'Thank you Jeevamrut team once again for serving us with great zeal and passion.',
                content: 'Thankyou Jeevamrut team for making Mihir s bday the most memorable one by delivering his super favourite Hapus (Alphonso) mangoes🥭🥭🥭🥭. We all enjoyed the yummiest mangoes and everyone gobbled up the milkshake and the mangoes in no time! Thank you Jeevamrut team once again for serving us with great zeal and passion.',
                img: 'assets/images/list/2.png'
            },
            {
                avatar: 'assets/images/avatar/1.png',
                author: 'Sampath Kumar',
                cate: 'Dolphin Durga County, Telegana',
                date: 'Apr 19, 2022',
                title: 'Happy to share and eat Mangoes with family.Thanks Guys.🙏🙏',
                content: 'Awesome guys, my father-in-law loved the mangoes after a long time. He is very fond of Mangoes, due to non-availability of good mangoes he lost interest in them. Due to you people he cherished those mangoes taste back again. Happy to share and eat Mangoes with family. Thanks Guys. 🙏🙏',
                img: 'assets/images/list/1.png'
            },
            {
                avatar: 'assets/images/avatar/1.png',
                author: 'Dr. Naganath Bodhankar',
                cate: 'Sri Ram Lake City',
                date: 'Oct 23, 2021',
                title:'Jeevamrut is a blessing for diabetic patients to control sugar levels, as we have to consume lot of raw vegetables as salads',
                content: 'Dear Jeevamrut team, Thank you for the organic freshly harvested leafy vegetables. All the leafy vegetables are excellent and can be used directly as salads without any fear of pollutants in it,  these organic leafy vegetables enables diabetic persons to control their sugar levels excellently.  Your step of cultivating organic veggies is wonderful.  The day is not far off that people will like only to consume organic foods.',
                img: 'assets/images/list/1.png'
            },
            {
                avatar: 'assets/images/avatar/1.png',
                author: 'Dr.Pradeep Rathore',
                cate: 'Kalyana kameshwari residency',
                date: '16 Apr, 2022',
                title: 'Mangoes are really tasty',
                content: 'The mangoes are really tasty. A great start to the mango season. My kids and wife loved it. Thanks to the great effort to home deliver such authentic mangoes. Thank you, Mayur, and Jeevamrut team.',
                img: 'assets/images/list/1.png'
            },
            {
                avatar: 'assets/images/avatar/1.png',
                author: 'Ninad Pande',
                cate: 'Mulund, Mumbai',
                date: '11 Apr, 2022',
                title: 'JEEVAMRUT che naturally grown AMBE. antishay sweet...suvasik....Ashi asavi Navin varshachi suruvaat',
                content: 'March unusual garami madhe gela ani ala april 1st with Marathi nav varsha din "gudi padwa" yach shubh dini ajun ek sukhad anubhav mhanje JEEVAMRUT che naturally grown AMBE. antishay sweet...suvasik....Ashi asavi Navin varshachi suruvaat... thank you team for delicious start of a Marathi new year.',
                img: 'assets/images/list/1.png'
            },
            /*------------------------------*/
            {
                avatar: 'assets/images/avatar/2.png',
                author: 'Radha',
                cate: 'Sai Mansion Apartments',
                date: ' Nov 12, 2021',
                title:'Nostalgia and going back to childhood days',
                content: 'All the vegetables I received were really fresh and they tasted really good. I could easily differentiate between the vegetables bought from the local market and jeevamruts vegetables based on taste. I loved all the fruits and vegetables I received especially the leafy vegetables and bananas. The best part is that all these are organic.',
                img: 'assets/images/list/2.png'
            },
            
            {
                avatar: 'assets/images/avatar/1.png',
                author: 'Raja Jeevan',
                cate: 'My Home Jewel',
                date: 'Sep 5, 2021',
                title:'Thanks for delivering vegetables with life!',
                content: ' We really loved them. We have been long standing (for over 10 years) customers with other online players and were unhappy with the quality and then lack of assortment of vegetables available with them. I was moved by  Vijay Rams Ghana and Drava Jeevamrutham videos on YouTube and was wanting to find a source to procure fresh and organic vegetables until I came across you.',
                img: 'assets/images/list/1.png'
            }
            ,
            {
                avatar: 'assets/images/avatar/1.png',
                author: 'Farmer Shashank',
                cate: 'Kalwakurthy',
                date: ' Nov 15, 2021',
                title:'Provides natural farming training, audits our farms, calls us Annadatas, pays us timely, and transparency with consumers (translated from telugu)',
                content: 'We had a really amazing experience working with Jeevamrut.in. Firstly, Jeevamrut visited us 4,5 months before the actual crop started and thoroughly analyzed our natural methods of farming, after making sure we use only organic methods they agreed to onboard us. Jeevamrut served as a bridge between us and customers providing us with good price.',
                img: 'assets/images/list/1.png'
            },
            
            {
                avatar: 'assets/images/avatar/1.png',
                author: 'Prachin Organics',
                cate: 'Miyapur',
                date: ' Dec 21, 2021',
                title:'Farmer Centric approach',
                content: 'Jeevamrut team helped us to go online with amazing technology. They have been our true technology partners helping us taking authentic natural cow based products to more and more customers.',
                img: 'assets/images/list/1.png'
            }
            
        ];
    }

    getList1(): Array<any> {
        return [
            {icon: 'laptop', title: 'Design', content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'},
            {icon: 'code', title: 'Ionic Native', content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'},
            {
                icon: 'appstore',
                title: 'UI Components',
                content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
            },
            {icon: 'cog', title: 'Publishing ', content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'}
        ];
    }

    getFList(): Array<any> {
        return [
            {
                title: 'Responsive',
                content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit ipsum dolor sit amet'
            },
            {
                title: 'Ionic Native',
                content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit ipsum dolor sit amet'
            },
            {
                title: 'UI Components',
                content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit ipsum dolor sit amet.'
            },
            {
                title: 'Support',
                content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit ipsum dolor sit amet'
            },
        ];
    }

    getTList(): Array<any> {
        return [
            {name: 'Angelina', img: 'assets/images/avatar/team.jpg'},
            {name: 'Angelina', img: 'assets/images/avatar/team.jpg'},
            {name: 'Angelina', img: 'assets/images/avatar/team.jpg'},
            {name: 'Angelina', img: 'assets/images/avatar/team.jpg'}
        ];
    }

    getNewList(): Array<any> {
        return [
            {title: 'Ionic Template', img: 'assets/images/list/21.png'},
            {title: 'Ionic Template', img: 'assets/images/list/22.jpg'},
            {title: 'Ionic Template', img: 'assets/images/list/23.jpg'},
            {title: 'Ionic Template', img: 'assets/images/list/24.jpg'},
        ];
    }

}
