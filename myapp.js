/* eslint-disable */
// generate something that can be used to help make a unique device netflix ESN number
const generateDeviceId = (esnLength = 30) => {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (var i = 0; i < esnLength; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

// simple caesar cipher just to trip someone up who tries to base64 decode our metadata
const caesarEncode = (source) => {
    const shiftBy = 3;
    let cipherText = "";
    const re = /[a-z]/;
    for (let i = 0; i < source.length; i++) {
        if (re.test(source.charAt(i))) cipherText += String.fromCharCode((source.charCodeAt(i) - 97 + shiftBy) % 26 + 97);
        else cipherText += source.charAt(i);
    }
    return cipherText;
}

const caesarDecode = (source) => {
    const shiftBy = 3;
    let decipheredText = "";
    const re = /[a-z]/;
    for (let i = 0; i < source.length; i++) {
        if (re.test(source.charAt(i))) decipheredText += String.fromCharCode((source.charCodeAt(i) - 97 + 26 - shiftBy) % 26 + 97);
        else decipheredText += source.charAt(i);
    }
    return decipheredText;
};

// const proxyServerRoot = "https://proxy-api.enjoymoviesyourway.com";
const proxyServerRoot = "http://localhost:4012";
// const sessionPath = `${proxyServerRoot}/session`;
const manifestPath = `${proxyServerRoot}/manifest`;
const licensePath = `${proxyServerRoot}/license`;

let state;

const initApp = () => {
    state = initState();
    console.log('initialize shaka app');
    // Debug logs, when the default of INFO isn't enough:
    // shaka.log.setLevel(shaka.log.Level.V2);
    // Install built-in polyfills to patch browser incompatibilities.
    shaka.polyfill.installAll();

    // shaka.net.NetworkingEngine.registerScheme('lic', EnjoyLicenseScheme);

    // For Netflix we will need a deviceId
    if (!localStorage.getItem('emwy-deviceid')) localStorage.setItem('emwy-deviceid', generateDeviceId());

    // Check to see if the browser supports the basic APIs Shaka needs.
    if (shaka.Player.isBrowserSupported()) {
        // Everything looks good!
        initPlayer();
    } else {
        // This browser does not have the minimum set of APIs we need.
        console.error('Browser not supported!');
    }
}

const initState = (initial) => {
    return (initial ? null : JSON.parse(localStorage.getItem('test-shaka-state') || null)) || {
        providers: {
            DISNEYPLUS: {
                tokens: {
                    accessToken: "eyJ6aXAiOiJERUYiLCJraWQiOiJ0Vy10M2ZQUTJEN2Q0YlBWTU1rSkd4dkJlZ0ZXQkdXek5KcFFtOGRJMWYwIiwiY3R5IjoiSldUIiwiZW5jIjoiQzIwUCIsImFsZyI6ImRpciJ9..JTgHJhAF4cuKAD6P.N-c70cB4skGeQK4xBnqcHgjLs2pvidZOdhHV6p8QVQl53jrw286J9rIjo0AsH6x86ej2eq2EOPllQqphrgm7EMjeYC6Ck_tUPoaA3dR8FEDIYcRkAkd0VS3PAuSCKTRG3Duao2ruGvrObmZLN-kpfiDpVUm5MgURhtFfYGuzoNDR4zPmfHAP8U5OL-0JC7d2_T2dAMn4NWtCRB6EQKIXz5hkOiog4cCfQIu8-WSjayr2mftYDDvCIpSpk3zpPJ-D3w2sDvyOLsfMthHUsOfvyYZsVzSJ39jS8L3VMIgVUaQ4gIEVXzn2I5wn2wpFLzodeshsgVjEOmU6Sx6Ct6voOr-moI_W-JIq9GQHoAyLJZ0SRioCymvx01AO9J9MwyORIlEc6u9MNE65x8Q_zaCz3wDHIZXoPmdnD7M23Sliealq9J5WIPiW2HqtOOt1YFovbEkIGJvd7gFxQLDpi9rXSOc0twvtxXpblrH_g6SmGaKbbNZM8dAz29VdKLIMQfELqOuCsH8RvXlTcwd488cikV60VktP-PV-MZihylRD8WKXxHVI2zM_h4lZgId_k_2K1f33RxQidMoRh1mhY1vlYVBblmN7geoJvqO55febhp7sbPOgGNLAcAB3nP2wz2XrcBgGFP2LyBC6upHvC7j0RVcNC3sZu41peAwYwbJQH0akNiaF9b_4Rw5e92sQzmDMq5pWQpYrfa4umL0_3vU1pzcaIVKS_znMLen4ZayJM7Fjp1P-8q4AjUxukKvXLQ0PcSeSGyd_5XLpiiGKC34Vz5m7V3GdEwuFgeV0iMaa3eZJisvI2Z3JvodDdAlieBCM9WwOhm6D_iycfA3vQ0f3wXMyoJooLwcGgw7EV44Ofb7snooRpX4-ojTZr5CcA_LXUjwSEia36ZgjhGS7rzgVDUNbYi9m8zS6A3mmPraef56M7KfwybWXHIQ6VgT3Bzi1zYFKQ9uwdiCWxwoGYKUkruaog5hYwP8iTEGBG8LEDgTQL3_5zg5a9z7UkhDpgP1RrV5fLyJ52Zw0wKgvVojHPltRpzNpW6L_YexVWbC7ovfdEM7ReVtryjDZNDpgC7vkg5JtooTEJ4DnQ4StwRdqMDpRjAUxokCsoS1RHDbnIePz6iDapvyFs9ggam_nj2MvPO9WPEMvin92oSqH8QFBas4wLoPcOJg0AND0xddQX2Ic9lNM4pXEp8XbE3w2asIMpTSDOF6o0RbWwxOCiyV72zNVauNsGaEyF69PHOBQ8RTZ83MlXtB4J_zkcVlNiinzRQtoshgw-JhgKvLlpO4lZSWig3zUd81AdKwwsb65PMeJ3mZmEAvASs341QZvDBF1aMFAYrmpqpzxCGRxNre5ptdhiDo7sv92xxg_-95tdmd1C3XmXiptHgk7ryhf2aF7IJfX1aqczwpTAdrGFbDrj4FszIUQjv3s2HwURaF7hh-KMXwqEZ-1sQy5hmCVyXDxc3LZlqAu99lKwUXeLCzosUASRSnv5piLWtx8DISee77uJuyYD6foc38j_IDxGxm7uKlAVInwpj7ksfNFa3Gn8syDkIxZE67r9E4NzTpB4fwdViYPAV0HF9LyGTcAt9C0gw9PQzlBsj4iiTkOIpYv7gO_Eu0omUjafAOri8OXEMVBUNhqiU-xLDq5hFaG3utGI7wASV7PIa-CFZHfwvMVaXmnDL5eoE49g5C7MDtsed5mLs8FkNeTj1JPU0fnmPYCX4UtJnvFrQdUqvtaqAAudqxkKyuudy0HJDnyfzonKqghYZh_et1qiXjQ7fJ9k2vn2ZoMz9VQciwTvMvakxyCJ7y8jn4zNh2v1HwKJlgRcGhvzsJk0p5OQ__kWvc6vUV36ceSzeIpWiA53Oqvokgu0sdgsV6-hY78EPXAuHdk1EdAOuBIhPVcXGbmUJGpGIvQBz-Gp4-2dxmzdXWs5-RcsQg2KJdjtCSzsxpkZHeX_Leaqxk_r9YRG8PcZIGstZOrwCRdRbL0D_Xe5IXJo1Ir-RyyJTAcYSvVxAGS_P5roQviAO31mjifHglRGrAHj2RczlyGMOjh-0Y9VqpL-zemihH-B4H8ZhzpSgRjD9as-OCRFNkIpmWbbfOs5VD7h71SbeIkGkZBDYM6_TanbvLnd8e3DFokkAluRKUjpema6YB2RPVl3aY72GLoySeQQ8HUppDsx0X0fk8PwSonwA4A2XRD5J2rrWajKa_B2PPT-df_6Wwdms1UncDjOurIUpR8oZbgjNwL1UDS4vu6NWrvX1_GacAi0JV5ULgcHAAHuOYCkr9SUsmceXvAYtfeKHUIb_-Bdx7imvuTl72i_hF2DLHGDjAkB3JJkNZ0QU_6V4qLPlYlm5Ji1xO8RbIfs8JZO9zkAPRukSA2AXIXrMfb0sGNdOZtpbOBn5brI_A5JkwAChJe5RFnVas0mv4qiXBGCJJbN6gHM8k1dNK7NlPEuVHAiIMZq8ZyP471QDpWLwvgDqIdO0sq0jI2GWrfnh_tLWPMPBPeyhOGI_5FYqRISHpbHiDTr96N3xtQRHVUp8OzzpuEopKMwUC8WpYpVJnRfWYtmnQ5f4GI1JkRYb-ITk-G0iM81wD6J1hOP9sH0C6GZ9ssce6vTobZpaQ7zQ8O18fIsChCHP-VYFPaPpAsZ8i-Z7lCD5Lifcn-8aYYenBNfLmmWF5lmuD3pD5VAB7RZIgPK-MPV6x_IrJNwFEyrPTUiAx-FtCi5yV7YTB1D7kvwnkQ0V_SYN0ARE0oHkhxfzEBBtT4ZgALrr6ozAfCK8pZ1Rhu9Hp7IXJpIQjKBuwQ93QJwt9US9GwKKoICM5ivfJqGG0NorQYeKCz0LeZsrYEWPkgaZDEgmU5pzsd5OeWIaftldzBZp9WjqEhxBoIjFsE6-31FecUP_X2yir89-ASkdXd5IBtydAQejk5wBkvjU1joh1MiZ8JS9iScnAN5_AvfVNvpH55lBGQESe3KWTlp6h45BGh7MhT2R_oPbvoO5aD7b7xfAb1t-PW6vFYKwnD5Ay915YlExf8MrTrw1hMjPiHyIvRPkU_8qR_bPhwwI2cPb_dr4v72_DFJirfdXCEw1zeIyuh_KudZXhjoYapemSWXUHNlFM-bHbNQxYOtfaGSorueQT3FhzmKD8pcTMC6aQvMqZLVLnW8p6VqYnfMMI7sWzTKd_k7dnSWUoWyjfz03iyEEkw3GYdouZIcAMlL_FI9QUUqVcbpmZ4RUJtLYLuKflI2H9U6MU1iLOCI3JKIhdODYoEjI7ILeq1YAF6yqu_4CQ5rHEqSOfafxiLUtXNs2EI4hF6WnQ.YntuvMuKXFa8VWiDl53rZQ",
                    refreshToken: "eyJ6aXAiOiJERUYiLCJraWQiOiJLcTYtNW1Ia3BxOXdzLUtsSUUyaGJHYkRIZFduRjU3UjZHY1h6aFlvZi04IiwiY3R5IjoiSldUIiwiZW5jIjoiQzIwUCIsImFsZyI6ImRpciJ9..EXPBupBtBR8fB1Yd.p_AHyGgOE7Unel5gigTbyBeUikEjm1ND6R-MvQAhnilCxFPqIaOT9d-vSVK9T2Y7xbvMsTTi56dcMwKiNc9uXPiJKVoZYPQ_w6rPuV1vKNOpSsWiXIiPYxHynHg0JJ7bY7O2UT9QB7RQelnEPqwsC8rJkj38zo7vCUyeqZsO0GiNOgmRGqYCzLUVk13v1reN0VzWyks7Mt6GiA-Z4V6C6zVOaFTToMqxYzv0Xc8vNtPgmEvpg8X7J-N9gPo9hJIiul97wNrWoOBKjNFeDV3Q5WGSY1c3jVMGPYeD7TLDQslCoOTR6QSrIJdIJldngyyDJunr7X3zxC36ZHp2HUZ1uaIjhsmmo55HECCcUJ-lZ7fBj9SyPxiVzP_vPqsfO7yzkmnNN4wXuJn6F4Gssg6c0OjdQk9eubixl_JKu9FC0Axvxl_l1DZUzuJbVEKsF8nax6V1KohIePQHaFDv2Bo8M6BGu5WJIlL14ymAA_oktKUgfDh56MMrP6ICu-jWSmqkJ0hL_1iyUyr4aFWE1CIeve-biyvZB2Ye2pmTwGu48YczM7ajfRTfZ7_VTsw0JpkWkV13W36hGso4jKNnDvJwLKU2fEv1exzu7SfPsn0fVzk71io1XMG34FDfuMCYO8QdjJdPvETsJjjyOCITkGpW1jnhPJ3TOBrkciJee3hpURvZO6LhMI-b1RcoVRDnxO4hLGP5RLbIjaA0lMi5LGq24LOOGzXUHAFpeJvPlJo5x-GixHt9njL1sTreqiVX95G5G6puu4ptFrObIHa9j8PysZBI54tvjB0RPYtNB3lEq_dYUPVqvAqMdJKVQim0HXoJns2GIoXFkBNyfukYFZoTPXLaoD6YLV8l476mIIvP-MH4Lr3P67kf6j-kdk_nmqL-EcYnkZwVojUzbLlGRmP4NRQDi1efGKOBObc2e5Yo2DMi6FyWsvP9c3nXxmEhlaPwBkeFawpOj7AdV3Se5qRb1og0l4xWZtZ85VQL1Habcu74c8D54Y23OGbNNIlweflKLvldgfhJsM1VMagcxV0h33L1SQa0fweMJXf39Iq-8TOJGQASXgzuzAf_9SJqtUoM6X7wu5Y8BgDunF0sN7yedBRg1Id4oo53SNSw1-8QGaEr0OTUKH2MWRGn7FvMnYCwPG2orEtkxdk1-JAnJoZmY6ChfYQFHfci3r5hEz2a31dCnf7R_tDTZ45S0nSknakqGz3TDjqUrz6M0zex8Bjqb45fPtGsqr2PncwiJ14odoQQ2Pji_gNlbWMF-yOiEU0S18cgVPFHT7TbjmxLqRbsr3NwrcSzMLY7d62awyO9_Re2tAfluyqP3iclYkdReGSZKE-9BCIiS11IJWR4nuUSfbSP97mU4JxIYer9eHbmt8CmqkTUMULkPotuOpq9Z5vZ2EOEnrBb9QyJrw2i__ZBV3J9lsgi-ESjDjFIDGM4K0rpm8_W31CWodrq720mI8OYLQ88ytXdfq6AwCk_VbqDbRFZi-Ka5UL0dMvIipy8l86V-euUhEZ2LMcLwByJcg_TDwdsQ68sr67AmoWyTMWfS_bGeG0ZO2RUcIKzkU_M7TX6rEG-cPAu3zYqC7TPrxVmEFwmv03ikmVoqwuo3UJMiFzeEGUz0Rgkj1vvuLLeXebJsfGggJxWjf5tYwNJ6CAT9-KAkvnLfTCgbvWmX0ZRMkGL_AfceEf6PO_P0XvZi7yxJekVhdbsGexV-8K2wmyI6YJKvypiLqZ2Ck4bpk1wa9uBxpEVgjsbwginC82OMX3gQdJGs2CJITajU9nhp25GVHsS06pQN9YewxYZ2oYMUy3by3CP01R1LpeIVGYj0xIIOMkD7Q8Hn9D_PiN9BjREUokv_Kaj219X_EF8CcyUo27eklUL8VLBDNdVreBCBTjUgUH7gAknhUM-m3b_EIZS8vtiisorZHVJ9x-9pfAimnYX27nLoeElfULeDC3xYqUFlXE3JTUgecdYOtY3ROjh5HR0PyfXW58FH_FFYtKKrwYhj1XPdfCnkDRgZQJ8Y1R5pj2Kg_ru5CfWwpN1dYVMDKzvCwRH2i4YLrgQG8WBCqOcbn5n3Ayzy5lPbwGmH19u3S4CsMycT9Poq2f5kJ8wMGPHi0eW9zK7vaOWtSSnfajWRPGS9AwfayLoPxsMDpwHzwD1tApj2hJOyo3d85G13nIjV9R8X05PrHDVHXbGJDxYTT1gvVSZvYtvMMxAnrJV7SmuvXtEn07jRp2Sg0E9Tpk8FnGOoxFYjNG5Vqo28nNA2ZPe1bUCCNqIIH-FJtFm5q-66dhrvB5MYBKYQYzIYzvzUkNcXOmJF333wBuedy65K_-fjLYQE2bdjjBYA7VnwHZfmxGYNziDykCCNTBUKgwk_-0ThvsSeSkNi7rzIFREnEU2YJTh0JZsDG-FO7rpOgE4ShP4b9Y9OjDjlT6d5jQ62HTLybi8X1dS819iUSkITpfT7nA_4lx-eJNod5jvaLgDi06MgD6RyyhoZyDCSpP5s3prMd9wBr6ZS1qmYArYkGlA0we6G2Sxt_EXVGZO3otQa-z4mjTFYpEn2QPnWQJMkkUURuZo5qZLKml7rvFLfR1fhNMGUBd6IForYEHxYrVnzm4QRcMBcngy-Z7bW3Joqn7H5oewaHxnQqi2spqBKGuhMjxR3lxCcNm0eo-5O1l4BbXLwn3lo0bwrfOUCXBtJ4hMjNWPm6bdaq9A0njsO7pTuyP5crSrQvR7UbkpvjAVjk6SoBXsL7H-RCn5OF4VautQwIFlYGR5NS1_3Y4mY8TOzx3K0CE_eA6Mu0DUZytuh4lLcQjJdwmF_zny40csioSuhsfGkdzWH5MWMon55cWqlkeju9qyT_zXyQYyC-X2gHCea7jiTs6QzbA0LOOOKwhOfN-bkCV2Y0RVm9IH6hh9p_ShXqsCvfBH6g23A0b0QCkdMOjIwB_T_-7OMzCUWmLpd41REZJAi_HJPTbs5iL_yCeTCCq1RtLs5Q-Sqi4lnIp7ThPlzAYQjCbAjjZhepzPsg38Jxd0so3Oz5DuWnw46tsgwwotUbBJ3KUIS2WE8bW-AOnuNMWYXGxST5hpP17ysUFbqE0xA3ytXESQ-7tt4ExumnRvoloCv78oqqZo_ri_p_uYaaqCoocoy93kgUrWG-BoTPUAKWnRTAW-RLIbfl14YsB9kitwO12uqI0TAKJ7gPCLB1idZCURQ9OUYeBIGC0UN5Klrk9q7S3nwnL7-L3pX40JhDmJG_E6NcW8tIS0K8ywRQ_x85TtLRImnjY6McqnZAUu08mGunkMIscXX2YGmfMhIZXOrnJkAfaI6TTW-YMpfh3G7igCEQFiAbrnCZWIf9hyMnI0JK04NSeMrksrv44d1fpJRTexyWcpztoj1pjyKhrxH0veMfSVFkoCliN8kmmftYJaU8z3T5Si1M407p7ycEHcEBAlL508bVsrczPpcsKX_iPGOtvT2oSebTVpIpm3UCAFaxAx92VCbIsAJB09-oWBtvGKxmsQEqQ8u0RGoEc3h3DfdTihL5zhSMW2wVn2OVhyGjxknXZu9zc4oVzMSHwoH1qod24YE6C3.ftKl6NEl_WpCb717IL4bYw",
                    expiresAt: 1630119804620,
                },
            },
            HBOMAX: {
                tokens: {
                    accessToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0aW1lc3RhbXAiOjE2MzEzMTY3MDk5NTksImV4cGlyYXRpb24iOjE2MzEzMzExMDk5NTksInBheWxvYWQiOnsiaGlzdG9yaWNhbE1ldGFkYXRhIjp7Im9yaWdpbmFsSXNzdWVkVGltZXN0YW1wIjoxNjMxMzE2NzA5OTU5LCJvcmlnaW5hbEdyYW50VHlwZSI6InVzZXJfcmVmcmVzaF9wcm9maWxlIiwib3JpZ2luYWxWZXJzaW9uIjoyfSwiZXhwaXJhdGlvbk1ldGFkYXRhIjp7ImF1dGh6VGltZW91dE1zIjoxNDQwMDAwMCwiYXV0aG5UaW1lb3V0TXMiOjMxMTA0MDAwMDAwLCJhdXRoekV4cGlyYXRpb25VdGMiOjE2MzEzMzExMDk5NTksImF1dGhuRXhwaXJhdGlvblV0YyI6MTY2MjQyMDcwOTk1OX0sInRva2VuUHJvcGVydHlEYXRhIjp7ImNsaWVudElkIjoiNTg1YjAyYzgtZGJlMS00MzJmLWIxYmItMTFjZjY3MGZiZWIwIiwiZGV2aWNlU2VyaWFsTnVtYmVyIjoiNDFiZTFlNzYtZWM1Ni00MjA4LThiN2MtMTcyYWNhMzU5YjYyIiwicGVybWlzc2lvbnMiOls1LDQsNyw4LDIsMV0sImNvdW50cnlDb2RlIjoiVVMiLCJwbGF0Zm9ybVRlbmFudENvZGUiOiJoYm9EaXJlY3QiLCJwcm9kdWN0Q29kZSI6Imhib01heCIsImRldmljZUNvZGUiOiJkZXNrdG9wIiwicGxhdGZvcm1UeXBlIjoiZGVza3RvcCIsInNlcnZpY2VDb2RlIjoiSEJPX01BWCIsImNsaWVudERldmljZURhdGEiOnsicGF5bWVudFByb3ZpZGVyQ29kZSI6ImJsYWNrbWFya2V0In0sImFjY291bnRQcm92aWRlckNvZGUiOiJodXJsZXkiLCJ1c2VySWQiOiI2NjBkZWViOS1hYjhiLTRlZTAtYmRiYy0wZDljNWM3MDU3OWEiLCJodXJsZXlBY2NvdW50SWQiOiI2NjBkZWViOS1hYjhiLTRlZTAtYmRiYy0wZDljNWM3MDU3OWEiLCJodXJsZXlQcm9maWxlSWQiOiI2NjBkZWViOS1hYjhiLTRlZTAtYmRiYy0wZDljNWM3MDU3OWEiLCJwYXJlbnRhbENvbnRyb2xzIjp7Im1vdmllIjoiTkMtMTciLCJ0diI6IlRWLU1BIiwicmF0aW5ncyI6eyJNT1ZJRSI6MjEsIlRWIjoyMX19LCJzdHJlYW1UcmFja2luZ0lkIjoiNjYwZGVlYjktYWI4Yi00ZWUwLWJkYmMtMGQ5YzVjNzA1NzlhIiwicmVxdWlyZXNBc3NldEF1dGh6IjpmYWxzZSwiYWZmaWxpYXRlQ29kZSI6Imhib19tYXhfb3R0IiwiaG9tZVNlcnZpY2VzUGFydGl0aW9uIjoidXMifSwiY3VycmVudE1ldGFkYXRhIjp7ImVudmlyb25tZW50IjoicHJvZHVjdGlvbiIsIm1hcmtldCI6InVzIiwidmVyc2lvbiI6Miwibm9uY2UiOiI4MGQ5NjIwYy0xMzc5LTQyY2MtODg5MC0xNzM1ZGMxYmM1MzEiLCJpc3N1ZWRUaW1lc3RhbXAiOjE2MzEzMTY3MDk5NTl9LCJwZXJtaXNzaW9ucyI6WzUsNCw3LDgsMiwxXSwidG9rZW5fdHlwZSI6ImFjY2VzcyIsImVudmlyb25tZW50IjoicHJvZHVjdGlvbiIsIm1hcmtldCI6InVzIiwidmVyc2lvbiI6Mn19.03UHosXjMld5pooQqXA5tvW3q89v14kxa68yiON_i7A",
                    refreshToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0aW1lc3RhbXAiOjE2MzEzMTY3MDk5NTksImV4cGlyYXRpb24iOjE2MzEzMzExMDk5NTksInBheWxvYWQiOnsiaGlzdG9yaWNhbE1ldGFkYXRhIjp7Im9yaWdpbmFsSXNzdWVkVGltZXN0YW1wIjoxNjMxMzE2NzA5OTU5LCJvcmlnaW5hbEdyYW50VHlwZSI6InVzZXJfcmVmcmVzaF9wcm9maWxlIiwib3JpZ2luYWxWZXJzaW9uIjoyfSwiZXhwaXJhdGlvbk1ldGFkYXRhIjp7ImF1dGh6VGltZW91dE1zIjoxNDQwMDAwMCwiYXV0aG5UaW1lb3V0TXMiOjMxMTA0MDAwMDAwLCJhdXRoekV4cGlyYXRpb25VdGMiOjE2MzEzMzExMDk5NTksImF1dGhuRXhwaXJhdGlvblV0YyI6MTY2MjQyMDcwOTk1OX0sInRva2VuUHJvcGVydHlEYXRhIjp7ImNsaWVudElkIjoiNTg1YjAyYzgtZGJlMS00MzJmLWIxYmItMTFjZjY3MGZiZWIwIiwiZGV2aWNlU2VyaWFsTnVtYmVyIjoiNDFiZTFlNzYtZWM1Ni00MjA4LThiN2MtMTcyYWNhMzU5YjYyIiwicGVybWlzc2lvbnMiOls1LDQsNyw4LDIsMV0sImNvdW50cnlDb2RlIjoiVVMiLCJwbGF0Zm9ybVRlbmFudENvZGUiOiJoYm9EaXJlY3QiLCJwcm9kdWN0Q29kZSI6Imhib01heCIsImRldmljZUNvZGUiOiJkZXNrdG9wIiwicGxhdGZvcm1UeXBlIjoiZGVza3RvcCIsInNlcnZpY2VDb2RlIjoiSEJPX01BWCIsImNsaWVudERldmljZURhdGEiOnsicGF5bWVudFByb3ZpZGVyQ29kZSI6ImJsYWNrbWFya2V0In0sImFjY291bnRQcm92aWRlckNvZGUiOiJodXJsZXkiLCJ1c2VySWQiOiI2NjBkZWViOS1hYjhiLTRlZTAtYmRiYy0wZDljNWM3MDU3OWEiLCJodXJsZXlBY2NvdW50SWQiOiI2NjBkZWViOS1hYjhiLTRlZTAtYmRiYy0wZDljNWM3MDU3OWEiLCJodXJsZXlQcm9maWxlSWQiOiI2NjBkZWViOS1hYjhiLTRlZTAtYmRiYy0wZDljNWM3MDU3OWEiLCJwYXJlbnRhbENvbnRyb2xzIjp7Im1vdmllIjoiTkMtMTciLCJ0diI6IlRWLU1BIiwicmF0aW5ncyI6eyJNT1ZJRSI6MjEsIlRWIjoyMX19LCJzdHJlYW1UcmFja2luZ0lkIjoiNjYwZGVlYjktYWI4Yi00ZWUwLWJkYmMtMGQ5YzVjNzA1NzlhIiwicmVxdWlyZXNBc3NldEF1dGh6IjpmYWxzZSwiYWZmaWxpYXRlQ29kZSI6Imhib19tYXhfb3R0IiwiaG9tZVNlcnZpY2VzUGFydGl0aW9uIjoidXMifSwiY3VycmVudE1ldGFkYXRhIjp7ImVudmlyb25tZW50IjoicHJvZHVjdGlvbiIsIm1hcmtldCI6InVzIiwidmVyc2lvbiI6Miwibm9uY2UiOiI4MGQ5NjIwYy0xMzc5LTQyY2MtODg5MC0xNzM1ZGMxYmM1MzEiLCJpc3N1ZWRUaW1lc3RhbXAiOjE2MzEzMTY3MDk5NTl9LCJwZXJtaXNzaW9ucyI6WzUsNCw3LDgsMiwxXSwidG9rZW5fdHlwZSI6ImFjY2VzcyIsImVudmlyb25tZW50IjoicHJvZHVjdGlvbiIsIm1hcmtldCI6InVzIiwidmVyc2lvbiI6Mn19.03UHosXjMld5pooQqXA5tvW3q89v14kxa68yiON_i7A",
                    expiresAt: 1630383042789,
                },
            },
            HULU: {
                tokens: {
                    cookies: "_h_csrf_id=33cf019eb08785c78310bc262b609e000ee8dc85c39616c51a024b562565226e; _hulu_assignments=eyJ2MSI6W119; __utmc=155684772; __utmz=155684772.1632774102.1.1.utmcsr=enjoymoviesyourway.com|utmccn=(referral)|utmcmd=referral|utmcct=/; __utma=155684772.1938250556.1632774102.1632774102.1632774102.1; stc115168=tsa:0:20210927205142|env:1%7C20211028202142%7C20210927205142%7C1%7C1047149:20220927202142|uid:1632774102057.864315210.1289454.115168.1775495301.:20220927202142|srchist:1047149%3A1%3A20211028202142:20220927202142; _ga=GA1.2.1938250556.1632774102; _gcl_au=1.1.664325636.1632774102; _scid=a20add85-d54a-4b5c-9d30-d53a8313e942; JSESSIONID=node07uuumxetetvh1h7ygo7vtw0y48911040.node0; _sctr=1|1632726000000; _hulu_uid=46639262; _hulu_e_id=3iGI8ZsdtvYXk39Jt06QDA; _hulu_bluekai_hashed_uid=925bd28da16179d7364d20b52738577a; _hulu_dt=BzMImKi3d9P3Qyo8IAfi8rdSJJ4-zP9FIPsNLrZwhgK_Uc%2FARQ--sBDZWXo_g6210czW_NtcYxxsCZ2kY2ZAAEKzdvBQG1polXXQBtbeEZCjyUyXjZosZazGg410KMTLgG8KjMnk1JPlARemuqyvV8X8n_%2FZ48DU2cjr3Z9UEvHe9bymIt5OTpebjP2g%2FnmOqHXT8Q3OcKx4PXZDepLM6MU10tOwN952T1GE%2FclcLqic4tFeQ1hMfXC_U0nK2UWvVU6jkPDyLUu1_VlLJ3BnUGmf_nRkLHnXm6_PjTWAkbeFP_f%2FtLqg9v8chIsanCLFv8Au1F8GhWWLNjoglQlT4G_iV_UIpn3cqMTQO8f6_EUPql5ogTDb11FDSh7ZnuuSDa2Oo_RZ9CokLSelcrUUBga5syVIE5%2FnuEGqqYwCX8Iid1zpYt8OifHJYU2W%2FLQRSkTsfjly%2FY%2FN7M8U3pDR72WFUVx%2FyFOML%2FRkh3AvvJKt2pSq34vvDXpwDxlZ1xqAegX_TmctL0DEpaWqxYoOWzJyrknUeWDAgwT1dSPi3cafKr2arvstQgFcLLnUkTY2Wof7u3S5fURzD102GciYsyjMACGnDa11n%2Fv1kodSHvID72YBJR5wadjtivikhKa%2FiLSvhXa0c0JhD%2FTVu3SkXzbUf2eBlAW0bURzhtD6W2kerxX5OXsMsAMeRuQajNYy2HHr5OrCKhqfdX2POiHrac7TRDDBEz6X0yrPGXIdYSnT3k7rM75wqzMPpnQUcB8y38l5EF1HdjRVtbOcT4PDPIydQM%2F7g0jeSgu7WDggz_iR%2FoqzU7NmD%2FR6gY61HmuOKNDzJEm0gQa%2FFZumWx4njwWAEsKEJLXhh1aAmK1u9Cgk5vgbUP4nhsPY%2FH%2F_SrIz5oqAZhxNH3NCm0MnyNIsZI6ciSazgCw-; _gid=GA1.2.1896733256.1632869755; cp_enjoy__tcv=eyJuYW1lIjoiX3RjdiIsInZhbHVlIjoiYjlhM2UxMTRkNzBmZTRiZDk4NDZhYTkzNmY3NzFhMDRmNzU5NWMyNmE0YWYwZDgwNWEzNWIzZmM4Mjk4MzBmNSIsInBhdGgiOiIvIiwiZXhwaXJlcyI6IjIwMjQtMDktMjhUMjI6NTY6MjAuMDAwWiIsImRvbWFpbiI6Ii5odWx1LmNvbSJ9; _hulu_pid=46639262; _hulu_pname=Chad; _hulu_is_p_kids=0; _hulu_pprotect=1632869786994; guid=99DBB037FBAD4F85B2069CF1694B9BDD; AMCVS_0A19F13A598372E90A495D62%40AdobeOrg=1; _persisted_HEM=fe4dfe6180784b1e13e694d04c9eda4c32361f2a16d29068d6c8790eaac7d338; s_cc=true; _hulu_plid=1886389224; _hulu_hbc=1632871941391; _csrf_id=44ff25a02852759e4dbf6af21510e0001839bc50e6e1a4041a088954086f6e04; cp_enjoy__csrf_id=eyJuYW1lIjoiX2NzcmZfaWQiLCJ2YWx1ZSI6IjQ0ZmYyNWEwMjg1Mjc1OWU0ZGJmNmFmMjE1MTBlMDAwMTgzOWJjNTBlNmUxYTQwNDFhMDg4OTU0MDg2ZjZlMDQiLCJwYXRoIjoiLyIsImV4cGlyZXMiOiIyMDI0LTA5LTI3VDIzOjMyOjE3LjAwMFoiLCJkb21haW4iOiIuaHVsdS5jb20ifQ%3D%3D; cp_enjoy__hulu_plid=eyJuYW1lIjoiX2h1bHVfcGxpZCIsInZhbHVlIjoiMTg4NjM4OTIyNCIsInBhdGgiOiIvIiwiZXhwaXJlcyI6IjIwMjQtMDktMjdUMjM6MzI6MTcuMDAwWiIsImRvbWFpbiI6Ii5odWx1LmNvbSJ9; bm_mi=F7254971A0F3A601842C29683FD760B2~IsON1ctJLKMJENrBwpl1vLV2ENgmT3s7Jhj9TleUdbH0dEtD49QzxSLjH3dH+1DUDwdly35zK+rab9liXvF1xf954AWUaniRVC7Nf8lBHFROvH87XNizuT4DLuyN6VIHacEAHHAnuU4fAGO9q9gsgGmRUm9KclBOht4NGdq66QJC1rpK5KxXb7OUXOusEjF6yMBAMpx/n/N/rAvTMnqkbw==; cp_enjoy_bm_mi=eyJuYW1lIjoiYm1fbWkiLCJ2YWx1ZSI6IkY3MjU0OTcxQTBGM0E2MDE4NDJDMjk2ODNGRDc2MEIyfklzT04xY3RKTEtNSkVOckJ3cGwxdkxWMkVOZ21UM3M3SmhqOVRsZVVkYkgwZEV0RDQ5UXp4U0xqSDNkSCsxRFVEd2RseTM1eksrcmFiOWxpWHZGMXhmOTU0QVdVYW5pUlZDN05mOGxCSEZST3ZIODdYTml6dVQ0REx1eU42VklIYWNFQUhIQW51VTRmQUdPOXE5Z3NnR21SVW05S2NsQk9odDROR2RxNjZRSkMxcnBLNUt4WGI3T1VYT3VzRWpGNnlNQkFNcHgvbi9OL3JBdlRNbnFrYnc9PSIsImRvbWFpbiI6Ii5odWx1LmNvbSIsInBhdGgiOiIvIiwibWF4QWdlIjo3MTk5LCJodHRwT25seSI6dHJ1ZX0%3D; XSRF-TOKEN=bcc0b166-af6c-459e-bd13-5e235525ef4a; _hulu_session=iQGdfjT9fhz%2F_8Uv7Q3Pnmk6OH8-0BWeZWBpuM0momAw4K_pbQ--BTRw1WChnEefGEmLKazxOtwIHO%2FI3lGRt0FBLWa_12NMxzOtX0tVsehyl8HCnBh7ekiWTJR5sVobSstAr0CNyQPera86q8WkEs57XSvhYMR9m9gGpYExSfYWv3A3_xrzHyz%2F_pHCzdocT42fJRngkj6bXk4oxDR01BEq4JRaRyRtWQHeh%2FwLK7JlF80ceHUokLyvTX2a4a8CLKC2mIE3iSO2NSbdJ7hA3uRnP%2FH9joNQZbMK16oWxm2_BAh945gFDJ0BEcftCTWFgqHsyKIGyF8xajIoiN9pfxhfie_fihXOHcRhzoq_b82GAEJtDfX7myE3t1ZPTR0uDUtY23MhawzmsJWQ6lzptg73gyBdyV6gnG87HBHZ1e0GwIui_NEmgnN2LsupG8PqAKULLtIhJQt2CUcEnXyVqJy8FIve%2FbbdZ2Xa5dRrrA9DO5iCAC%2FjSMqzH%2F%2Fjv3TKR6On4RruDri9L7J%2Fo%2FQuCVLWffq7DZdq5Ga5uiLQivDpNBR0n1mG0qMcTQqD05_VYNnOtU%2FggwYXBBVgA0rI7xlu0RkF1dJslkYgXuX2htTqyGuwgY8MIck6hoR8qHs9n4cPXA6x4wS31XJ%2FMI0vxv03A0YWzQsDcI5DfjHH8uZVvk5Ks4H7mbqCvXXIPC7AfIXy1CjdNHkR8TFpKCo7vGbUycngLAlbONs3fjF%2F1VHn_bNfNxgzSViw4KW%2F22_yVPLpSMjyxi280RzqKop1Dw7lQAVKBuXF9oqbyw__IYtgywleWIarU9yMAUMCFIQ9vF2s%2FZkTTseu6_NJIp5W1wbh4CLp6uoaZYJvdF5pfxhvfMta8cwOHxdzFb7Suujrc_4SnU_YgjTtl77v7aBmBuOezu%2F%2FZJuqkBIUf7ZpwxWewyneoAccILSbMOK9bLYR5j499yZWZZBCz4sq9MAGy4kHc6k0hyw-; _hulu_pgid=394747907; cp_enjoy__hulu_pgid=eyJuYW1lIjoiX2h1bHVfcGdpZCIsInZhbHVlIjoiMzk0NzQ3OTA3IiwicGF0aCI6Ii8iLCJkb21haW4iOiIuaHVsdS5jb20iLCJleHBpcmVzIjoiMjAyNC0wOS0yOFQxMTozOTozMS4wMDBaIiwibWF4QWdlIjo5NDYwODAwMCwic2VjdXJlIjp0cnVlfQ%3D%3D; cp_enjoy__hulu_assignments=eyJuYW1lIjoiX2h1bHVfYXNzaWdubWVudHMiLCJ2YWx1ZSI6ImV5SjJNU0k2VzExOSIsInBhdGgiOiIvIiwiZG9tYWluIjoiLmh1bHUuY29tIiwiZXhwaXJlcyI6IjIwMjQtMDktMjhUMTE6Mzk6MzEuMDAwWiIsIm1heEFnZSI6OTQ2MDgwMDAsInNlY3VyZSI6dHJ1ZX0%3D; cp_enjoy__hulu_session=eyJuYW1lIjoiX2h1bHVfc2Vzc2lvbiIsInZhbHVlIjoiaVFHZGZqVDlmaHovXzhVdjdRM1BubWs2T0g4LTBCV2VaV0JwdU0wbW9tQXc0S19wYlEtLUJUUncxV0NobkVlZkdFbUxLYXp4T3R3SUhPL0kzbEdSdDBGQkxXYV8xMk5NeHpPdFgwdFZzZWh5bDhIQ25CaDdla2lXVEpSNXNWb2JTc3RBcjBDTnlRUGVyYTg2cThXa0VzNTdYU3ZoWU1SOW05Z0dwWUV4U2ZZV3YzQTNfeHJ6SHl6L19wSEN6ZG9jVDQyZkpSbmdrajZiWGs0b3hEUjAxQkVxNEpSYVJ5UnRXUUhlaC93TEs3SmxGODBjZUhVb2tMeXZUWDJhNGE4Q0xLQzJtSUUzaVNPMk5TYmRKN2hBM3VSblAvSDlqb05RWmJNSzE2b1d4bTJfQkFoOTQ1Z0ZESjBCRWNmdENUV0ZncUhzeUtJR3lGOHhhaklvaU45cGZ4aGZpZV9maWhYT0hjUmh6b3FfYjgyR0FFSnREZlg3bXlFM3QxWlBUUjB1RFV0WTIzTWhhd3ptc0pXUTZsenB0ZzczZ3lCZHlWNmduRzg3SEJIWjFlMEd3SXVpX05FbWduTjJMc3VwRzhQcUFLVUxMdEloSlF0MkNVY0VuWHlWcUp5OEZJdmUvYmJkWjJYYTVkUnJyQTlETzVpQ0FDL2pTTXF6SC8vanYzVEtSNk9uNFJydURyaTlMN0ovby9RdUNWTFdmZnE3RFpkcTVHYTV1aUxRaXZEcE5CUjBuMW1HMHFNY1RRcUQwNV9WWU5uT3RVL2dnd1lYQkJWZ0Ewckk3eGx1MFJrRjFkSnNsa1lnWHVYMmh0VHF5R3V3Z1k4TUljazZob1I4cUhzOW40Y1BYQTZ4NHdTMzFYSi9NSTB2eHYwM0EwWVd6UXNEY0k1RGZqSEg4dVpWdms1S3M0SDdtYnFDdlhYSVBDN0FmSVh5MUNqZE5Ia1I4VEZwS0NvN3ZHYlV5Y25nTEFsYk9OczNmakYvMVZIbl9iTmZOeGd6U1ZpdzRLVy8yMl95VlBMcFNNanl4aTI4MFJ6cUtvcDFEdzdsUUFWS0J1WEY5b3FieXdfX0lZdGd5d2xlV0lhclU5eU1BVU1DRklROXZGMnMvWmtUVHNldTZfTkpJcDVXMXdiaDRDTHA2dW9hWllKdmRGNXBmeGh2Zk10YThjd09IeGR6RmI3U3V1anJjXzRTblVfWWdqVHRsNzd2N2FCbUJ1T2V6dS8vWkp1cWtCSVVmN1pwd3hXZXd5bmVvQWNjSUxTYk1PSzliTFlSNWo0OTl5WldaWkJDejRzcTlNQUd5NGtIYzZrMGh5dy0iLCJwYXRoIjoiLyIsImRvbWFpbiI6Ii5odWx1LmNvbSIsImV4cGlyZXMiOiIyMDIxLTEwLTI5VDExOjM5OjMxLjAwMFoiLCJtYXhBZ2UiOjI1OTIwMDAsInNlY3VyZSI6dHJ1ZSwiaHR0cE9ubHkiOnRydWV9; _hulu_metrics_context_v1_=%7B%22cookie_session_guid%22%3A%2205c5ae1cb70342631830545343062de3%22%2C%22referrer_url%22%3A%22%22%2C%22curr_page_uri%22%3A%22urn%3Ahulu%3Ahub%3Ahome%22%2C%22primary_ref_page_uri%22%3Anull%2C%22secondary_ref_page_uri%22%3Anull%2C%22curr_page_type%22%3A%22home%22%2C%22primary_ref_page_type%22%3Anull%2C%22secondary_ref_page_type%22%3Anull%7D; ak_bmsc=B2EC11A805CC000DE0E961B684B78954~000000000000000000000000000000~YAAQZJURYAWi3KJ6AQAA+ktaMQ2406uOo0E6LAe2AHEYNvOgZBa6TQv2UGWgojgc3fDQB/O/e5ah5obISLpizhl3liP6cJMSzNQQUvYXeOINxnd0Nzpa1ibS4ljzqdsBEgdWFgzgMA6I0ylcJx2EXuiAhLWpGeI2XglZ0NlmzzUGPUnNzCroC8yMToFQlL/bUn+Hf1Q4KUm5BbC/v5VK9BYbSY8fBT8YrfKrhvIWlc116kt+HdVz7d2yYRkUgh1Hg0rMYke5gEqnjCHehRQ2vVVbgGnEvWzuq1CtoQjzRkLxA0On0lGo7ayxEMv89DUTCQb8cGIQ5ad3oSkR8tPzgM0qwQEeP7DwuwjbFO9DEKabWh7P1bGtLhxfpw/zS2KSjtSgHBQGz3Lvw6GZ8dY0/uYa9Ig360PvITJNN6nH85lpo/Y6Rs//glu4D2Qstmsd4PJIgUb+5Z3h1+qUXnhGJC+Eyz6dxXFsih9wn39N/pM4x1czRSt/sSf0hkh5qg==; cp_enjoy_ak_bmsc=eyJuYW1lIjoiYWtfYm1zYyIsInZhbHVlIjoiQjJFQzExQTgwNUNDMDAwREUwRTk2MUI2ODRCNzg5NTR%2BMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwfllBQVFaSlVSWUFXaTNLSjZBUUFBK2t0YU1RMjQwNnVPbzBFNkxBZTJBSEVZTnZPZ1pCYTZUUXYyVUdXZ29qZ2MzZkRRQi9PL2U1YWg1b2JJU0xwaXpobDNsaVA2Y0pNU3pOUVFVdllYZU9JTnhuZDBOenBhMWliUzRsanpxZHNCRWdkV0ZnemdNQTZJMHlsY0p4MkVYdWlBaExXcEdlSTJYZ2xaME5sbXp6VUdQVW5OekNyb0M4eU1Ub0ZRbEwvYlVuK0hmMVE0S1VtNUJiQy92NVZLOUJZYlNZOGZCVDhZcmZLcmh2SVdsYzExNmt0K0hkVno3ZDJ5WVJrVWdoMUhnMHJNWWtlNWdFcW5qQ0hlaFJRMnZWVmJnR25Fdld6dXExQ3RvUWp6UmtMeEEwT24wbEdvN2F5eEVNdjg5RFVUQ1FiOGNHSVE1YWQzb1NrUjh0UHpnTTBxd1FFZVA3RHd1d2piRk85REVLYWJXaDdQMWJHdExoeGZwdy96UzJLU2p0U2dIQlFHejNMdnc2R1o4ZFkwL3VZYTlJZzM2MFB2SVRKTk42bkg4NWxwby9ZNlJzLy9nbHU0RDJRc3Rtc2Q0UEpJZ1ViKzVaM2gxK3FVWG5oR0pDK0V5ejZkeFhGc2loOXduMzlOL3BNNHgxY3pSU3Qvc1NmMGhraDVxZz09IiwiZG9tYWluIjoiLmh1bHUuY29tIiwicGF0aCI6Ii8iLCJleHBpcmVzIjoiMjAyMS0wOS0yOVQxMzozOToyOC4wMDBaIiwibWF4QWdlIjo3MTk1LCJodHRwT25seSI6dHJ1ZX0%3D; _gat_hulu1=1; utag_main=v_id:017c28eb9b2300526354f7d719e803072005606a01888$_sn:3$_ss:1$_st:1632917380188$dc_visit:1$ses_id:1632915580188%3Bexp-session$_pn:1%3Bexp-session$_prevpage:%2Fhub%2Fhome%3Bexp-1632919180857$hhid:0053a6298c752da7933b3a31135e2d7298dc02caac382ba34286ee7935794565%3Bexp-session$hpid:0053a6298c752da7933b3a31135e2d7298dc02caac382ba34286ee7935794565%3Bexp-session$k_sync_ran:1%3Bexp-session$krux_sync_session:1632915580188%3Bexp-session$g_sync_ran:1%3Bexp-session$dc_event:1%3Bexp-session$dc_region:us-east-1%3Bexp-session; _uetsid=4f3db26020af11ec8390e3856ae44788; _uetvid=8390ec00579411eba256b74b2482094e; AMCV_0A19F13A598372E90A495D62%40AdobeOrg=-408604571%7CMCIDTS%7C18899%7CMCMID%7C57935084880191295912473131446238217316%7CMCAAMLH-1633520386%7C7%7CMCAAMB-1633520386%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCCIDH%7C-724531244%7CMCOPTOUT-1632922786s%7CNONE%7CMCAID%7C3031E81E4D93F3C0-60001764D2175998%7CvVersion%7C4.6.0; bm_sv=D9D2B8956B01F8488F5E7BE47D6994C2~78lQk5X+4vKPt76fxqG5LPQJpVMxGOvw04hhhRdCzLJigHirlvJmMK3IoM/SOeGyE+TZXqOxaZgzQR51syC1GgW6rQzEyYWDZ1zy0srQT61zZb6SiE8u1i7MLrMofUWmhiEKyIgotCiRejCkINVL4g==; cp_enjoy_bm_sv=eyJuYW1lIjoiYm1fc3YiLCJ2YWx1ZSI6IkQ5RDJCODk1NkIwMUY4NDg4RjVFN0JFNDdENjk5NEMyfjc4bFFrNVgrNHZLUHQ3NmZ4cUc1TFBRSnBWTXhHT3Z3MDRoaGhSZEN6TEppZ0hpcmx2Sm1NSzNJb00vU09lR3lFK1RaWHFPeGFaZ3pRUjUxc3lDMUdnVzZyUXpFeVlXRFoxenkwc3JRVDYxelpiNlNpRTh1MWk3TUxyTW9mVVdtaGlFS3lJZ290Q2lSZWpDa0lOVkw0Zz09IiwiZG9tYWluIjoiLmh1bHUuY29tIiwicGF0aCI6Ii8iLCJtYXhBZ2UiOjcxNTUsImh0dHBPbmx5Ijp0cnVlfQ%3D%3D; metrics_tracker_session_manager=%7B%22session_id%22%3A%2299DBB037FBAD4F85B2069CF1694B9BDD-61b881e0-c49a-4c03-9aa7-ba34883a468b%22%2C%22creation_time%22%3A1632915576563%2C%22visit_count%22%3A1%2C%22session_seq%22%3A23%2C%22idle_time%22%3A1632915622427%7D",
                    expiresAt: 1632872993472,
                }
            },
            AMAZON: {
                tokens: {
                    cookies: "session-id=133-8373025-1570834; ubid-main=130-0828590-3776626; x-main=\"ms4Q5GPjHIQfotg0j@VKNsq@DgFAM7C2\"; at-main=Atza|IwEBIAdEzCoHdjBLeUvo2WfVL68YZT-xXca-m4NJhi_r5STovJNSRaJjWoqtMmmVDdh9bTsXyU-q27qg8B92FoqGGG2mesp3Pw-dsheBiB24RPbH5MnVYIQn5r1nwIdNI9SrBVtzuiWyuOkdg5Lb8lXLbWZzmMOwcWuZFshaXjmkCg7fLMyrVUR1xNTb0Af0bLfb5ugK8JPFccJbWv-H7qiVe3Mu; sess-at-main=\"NyG2KETCK+qyh86Z+y/idArdjHlyux7YmFkO0FoTR9E=\"; sst-main=Sst1|PQFzfKHI8GqcDX6utsyuoK0ECQ9qDA5H5Te8TcU4nK0J5QxJvNE31j05FPnvMNG2PCgG3nOJpYCtNxuWT-FRm46m9cd8D0cu9j9dpDLBRX5e9SvquSv7loSMNA6FqLeekPM4hvwot9vm3JCl6wRWinz8kNyUzrYvVQWekaJ4nhvDCUbdK6bRlphRp1QJUdLZ7e1YGEu-gPGn0s-_SxmRC7I0DcWofHptaLcjhrklZAjf8XZbnlBYT5YVmDOtyS911ZafGGzQwI4HufRdrKMJRhB1dlogK7XZGd_0r6ieM4ldIu4; lc-main=en_US; session-id-time=2082787201l; i18n-prefs=USD; csm-hit=tb:s-ZD34YQBJR1V8MZWQTQFC|1632497663456&t:1632497663457&adb:adblk_no; session-token=\"ctlMkhpHIxXu9TYYZQCcHImF3bU9/d+JafVKJjqnzo43DoKifYvTZjtPuv6Om14CzUm+HZXWFFAY+xqCzSJh1kgl03CEAbuI1/A0pGxan8rcWrpRNUa2/EDtRTG78Sj0zN71bQyvdLB7NtoCW+vZoC39C5xwQGFNcMYjZpdlTpC/A382+3BUV2DyoGvy83oWyiJbLeGZDtR+0LgQcOvJJQ==\"; skin=noskin",
                    expiresAt: 1630383042789,
                }
            },
            // YOUTUBE: {
            //   tokens: {
            //     cookies: "VISITOR_INFO1_LIVE=ZUWs-NLdWwQ; CONSENT=YES+US.en+201912; NID=220=Ph1FCQAiOWWUvSHHVWJVwM9pSBY04jALTcuyHhm2AaXHBoWWCi-kR9k5gQB0qPZNqtKy0_EE6WPjlU_0zxngtuOoG2emMNipbeb3ecH1elc4LQICWThSHxlK6x8_hJFHm--ny3--amOWCDAlx_CvX3XlIqziCyW4xTJL65AJVPM; PREF=f6=80&tz=America.Los_Angeles&al=en&f5=30000; LOGIN_INFO=AFmmF2swRQIgaRnHZSyWnER6XkLJqTMqxoevP50j2h6sEBtghse3YGwCIQCs11HCPlwuvH7_qbk5nT65Q-rUwlqjlyVfd2PfJucedg:QUQ3MjNmeUdqeF96NjdaRHp5Q1N5UEVPeFc0OGR4RnExS1dWclBwSDRaZFB5UVBnRElRcVhydXJHQ0lEWkpfOUkyVS11M2Q3V2NpYi13ekEyXzJGS0ZoRVA3MktXZlVjU0tjT1ktUC1xNDRVZ1FRUWtyQnc2RFdBb1ZqWENEOGsyajZ1WnE4S2g3NHRMMXYtSEo3YmM1SjFpRV9qb0V0OXJB; YSC=5KgzbKp09KQ; SID=BgjQnMCdg09ZVGbZgCLLhaaVcKX8CxDGe7D9P3P2pmZCY9DPcjG3qjB9POHd6odOiD3OOQ.; __Secure-1PSID=BgjQnMCdg09ZVGbZgCLLhaaVcKX8CxDGe7D9P3P2pmZCY9DPcePw2ZvN0PeTD_3H0hSI0A.; __Secure-3PSID=BgjQnMCdg09ZVGbZgCLLhaaVcKX8CxDGe7D9P3P2pmZCY9DPfBG7ArRsT1y__BbxoAhweg.; HSID=AXqswZXERx5MMG82T; SSID=AUdamZO0U7NHythYb; APISID=9CK9ISJabveFv6Ut/AO45SCrXmy0ZE8CT4; SAPISID=LIG4OWrC86w7ZJ0j/AFHFbNtifEQnLMBoE; __Secure-1PAPISID=LIG4OWrC86w7ZJ0j/AFHFbNtifEQnLMBoE; __Secure-3PAPISID=LIG4OWrC86w7ZJ0j/AFHFbNtifEQnLMBoE; SIDCC=AJi4QfHKTuPiiYpTHD7cAhZlTR8r7pi6ErjFrPGHGze6TqnelAlzayqawECCFhopu5XTJdzh2A; __Secure-3PSIDCC=AJi4QfED1ECrAlveCXpMFJujbJIjVKrv6vXR3fmIOgv3sQDTQQNE7_Gy2bCtr77qc1BmtGGmtlw;",
            //     expiresAt: 1630383042789,
            //   }
            // },
            NETFLIX: {
                tokens: { accessToken: { userName: "chad@chadistheman.com", password: "YSTRAYENT" }, expiresAt: 1630383042789 }
            }
        }
    };
};

const EMYW_PROXY_API_KEY = "e1d060d6-fa29-11eb-9a03-0242ac130003";

const buildEMYWMeta = (provider) => {
    if (!state.providers[provider]) state.providers[provider] = initState(true).providers[provider];
    const metaData = {
        apiKey: EMYW_PROXY_API_KEY,
        provider,
        enjoyDeviceId: localStorage.getItem('emwy-deviceid'),
        tokens: state.providers[provider].tokens,
        licenseUrl: state.providers[provider].licenseUrl,
        drmSession: state.providers[provider].drmSession
    };
    return metaData;
};

const initPlayer = async () => {
    // Create a Player instance.
    const video = document.getElementById('video');
    const player = new shaka.Player(video);

    // Attach player to the window to make it easy to access in the JS console.
    window.player = player;

    // Listen for error events.
    player.addEventListener('error', onErrorEvent);

    // set some player defaults
    player.configure({
        preferredAudioLanguage: 'en',
    });

    // We send the emyw-meta to the proxy server for processing
    player.getNetworkingEngine().registerRequestFilter((type, request) => {
        // RequestType = {
        //   'MANIFEST': 0,
        //   'SEGMENT': 1,
        //   'LICENSE': 2,
        //   'APP': 3,
        //   'TIMING': 4,
        //   'SERVER_CERTIFICATE': 5,
        // };

        // Only add headers to license requests:
        // console.log('there is a request type', type);
        // if (type == shaka.net.NetworkingEngine.RequestType.MANIFEST) {
        //   console.log('there was a manifest request', request.uris);
        // } else
        if (type == shaka.net.NetworkingEngine.RequestType.SEGMENT) {
            // Note that once there were some CORS errors that were cached. Disabling cache in the network tab of devtools resolve it.
            // We can't add the cache-control header due to CORS. Consider clearing the Cache for sites that cause this cache poisoning
            // Another approach is to cache-bust by adding something to the path as below
            if (state.currentProvider === "DISNEYPLUS" && request.uris && request.uris.length > 0) request.uris[0] += `?vary=${generateDeviceId(6)}`;
            // console.log('there was a segment request', request);
        } else if (type == shaka.net.NetworkingEngine.RequestType.LICENSE) {
            if (state.providers[state.currentProvider].drmSession) state.providers[state.currentProvider].drmSession.sessionId = request.sessionId;
            const emywMeta = buildEMYWMeta(state.currentProvider);
            emywMeta.videoId = state.currentVideoId;
            request.headers = Object.assign(request.headers, buildEMYWHeader(emywMeta));
        }
    });
}

const onErrorEvent = (event) => {
    // Extract the shaka.util.Error object from the event.
    onError(event.detail);
}

const onError = (error) => {
    // Log the error.
    console.error('Error code', error.code, 'object', error);
    if (state.attemptRegenerateIfFail) {
        console.warn('Attempting to forceregenerate manifest...');
        handlePlay(state.currentProvider, state.currentVideoId, true);
    }
}

document.addEventListener('DOMContentLoaded', initApp);

const buildEMYWHeader = (emywMetaJson) => {
    const emywMeta = caesarEncode(btoa(JSON.stringify(emywMetaJson)))
    console.log((new TextEncoder().encode(emywMeta)).length);
    const headers = { 'emyw-meta': emywMeta };
    return headers;
}

// const updateAuthSession = async (provider) => {
//   const resAuth = await fetch(sessionPath, { method: 'POST', headers: buildEMYWHeader(buildEMYWMeta(state.currentProvider)) });
//   const bodyText = await resAuth.text();
//   state.providers[provider].tokens = JSON.parse(atob(caesarDecode(bodyText)));
//   localStorage.setItem('test-shaka-state', JSON.stringify(state));
//   console.log(state);
// };

const requestManifest = async (provider, videoId, regenerateManifest) => {
    const emywMeta = buildEMYWMeta(provider);
    emywMeta.videoId = videoId;
    emywMeta.includeFullManifestText = true;
    emywMeta.forceRegenerate = regenerateManifest;
    const resManifest = await fetch(manifestPath, { method: 'POST', headers: buildEMYWHeader(emywMeta) });
    const bodyText = await resManifest.text();
    const manifestObject = JSON.parse(atob(caesarDecode(bodyText)));
    console.log(manifestObject);
    return manifestObject;
};

const handlePlay = async (provider, videoId, regenerateManifest) => {
    console.log('Play event');
    // Try to load a manifest.
    try {
        state.currentProvider = provider;
        state.currentVideoId = videoId;
        state.attemptRegenerateIfFail = !regenerateManifest;
        // Tell the proxy server to prepare the manifest
        const enjoyManifestObject = await requestManifest(provider, videoId, regenerateManifest);
        if (enjoyManifestObject.failMessage) throw new Error(enjoyManifestObject.failMessage);
        const manifestUrl = `${manifestPath}/${enjoyManifestObject.manifestUrlKey}`;

        state.providers[provider].tokens = enjoyManifestObject.tokens; // update incase they were refreshed
        state.providers[provider].licenseUrl = enjoyManifestObject.licenseUrl;
        state.providers[provider].drmSession = enjoyManifestObject.drmSession;

        const NETFLIX_SERVER_CERT = "Cr0CCAMSEOVEukALwQ8307Y2+LVP+0MYh/HPkwUijgIwggEKAoIBAQDm875btoWUbGqQD8eAGuBlGY+Pxo8YF1LQR+Ex0pDONMet8EHslcZRBKNQ/09RZFTP0vrYimyYiBmk9GG+S0wB3CRITgweNE15cD33MQYyS3zpBd4z+sCJam2+jj1ZA4uijE2dxGC+gRBRnw9WoPyw7D8RuhGSJ95OEtzg3Ho+mEsxuE5xg9LM4+Zuro/9msz2bFgJUjQUVHo5j+k4qLWu4ObugFmc9DLIAohL58UR5k0XnvizulOHbMMxdzna9lwTw/4SALadEV/CZXBmswUtBgATDKNqjXwokohncpdsWSauH6vfS6FXwizQoZJ9TdjSGC60rUB2t+aYDm74cIuxAgMBAAE6EHRlc3QubmV0ZmxpeC5jb20SgAOE0y8yWw2Win6M2/bw7+aqVuQPwzS/YG5ySYvwCGQd0Dltr3hpik98WijUODUr6PxMn1ZYXOLo3eED6xYGM7Riza8XskRdCfF8xjj7L7/THPbixyn4mULsttSmWFhexzXnSeKqQHuoKmerqu0nu39iW3pcxDV/K7E6aaSr5ID0SCi7KRcL9BCUCz1g9c43sNj46BhMCWJSm0mx1XFDcoKZWhpj5FAgU4Q4e6f+S8eX39nf6D6SJRb4ap7Znzn7preIvmS93xWjm75I6UBVQGo6pn4qWNCgLYlGGCQCUm5tg566j+/g5jvYZkTJvbiZFwtjMW5njbSRwB3W4CrKoyxw4qsJNSaZRTKAvSjTKdqVDXV/U5HK7SaBA6iJ981/aforXbd2vZlRXO/2S+Maa2mHULzsD+S5l4/YGpSt7PnkCe25F+nAovtl/ogZgjMeEdFyd/9YMYjOS4krYmwp3yJ7m9ZzYCQ6I8RQN4x/yLlHG5RH/+WNLNUs6JAZ0fFdCmw=";

        player.configure({
            drm: {
                servers: {
                    'com.widevine.alpha': `${licensePath}/${enjoyManifestObject.manifestUrlKey}`,
                    'com.microsoft.playready': `${licensePath}/${enjoyManifestObject.manifestUrlKey}`,
                },
                advanced: {
                    'com.widevine.alpha': {
                        serverCertificate: provider === "NETFLIX" ? Uint8Array.from(window.atob(NETFLIX_SERVER_CERT), c => c.charCodeAt(0)) : new Uint8Array(0)
                    }
                },
            },
            // streaming: {
            //   // Netflix video stalls/freezes a lot for some reason. Not sure if we should just enable this for all
            //   // actually, the real issue was described here noticed on Chrome only: https://github.com/google/shaka-player/issues/438
            //   stallEnabled: true
            // }
        });

        if (enjoyManifestObject.manifest) {
            console.log('loading manifest after POST');
            const mimeType = enjoyManifestObject.manifest.indexOf('#EXTM3U') > -1 ? 'x-mpegurl' : 'dash+xml'
            await player.load(`data:application/${mimeType};base64,${window.btoa(enjoyManifestObject.manifest)}`);
        } else {
            // This option mainly here for Roku which requires a URL to get
            console.log('loading manifest with GET');
            await player.load(manifestUrl);
        }
        // This runs if the asynchronous load is successful.
        console.log('The video has now been loaded!');
    } catch (e) {
        // onError is executed if the asynchronous load fails.
        onError(e);
    }
}
